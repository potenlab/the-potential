// supabase/functions/approve-member/index.ts
// Edge Function for admin member/expert approval actions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types for approval actions
type ApprovalAction = 'approve' | 'reject';
type ApprovalTarget = 'member' | 'expert';

interface ApprovalPayload {
  user_id: string;
  action: ApprovalAction;
  target: ApprovalTarget;
  rejection_reason?: string;
  expert_profile_id?: string; // Required when target is 'expert'
}

interface AuditLogEntry {
  action: string;
  admin_id: string;
  target_user_id: string;
  target_type: ApprovalTarget;
  approval_action: ApprovalAction;
  timestamp: string;
  details: Record<string, unknown>;
}

// Create audit log entry
async function createAuditLog(
  supabase: SupabaseClient,
  entry: Omit<AuditLogEntry, 'timestamp'>
): Promise<void> {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Log to console for monitoring
  console.log('[AUDIT]', JSON.stringify(logEntry));

  // Store audit in notifications metadata for traceability
  // In production, consider a dedicated audit_logs table
  try {
    await supabase.from('notifications').insert({
      user_id: entry.admin_id,
      type: 'system_announcement',
      title: `Admin Action: ${entry.approval_action} ${entry.target_type}`,
      body: `Target user: ${entry.target_user_id}`,
      metadata: {
        audit: true,
        ...logEntry,
      },
      is_read: true, // Admin logs should be marked as read
    });
  } catch (error) {
    // Audit log failure should not block the main operation
    console.error('Failed to store audit log:', error);
  }
}

// Verify that the requesting user is an admin
async function verifyAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, approval_status')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return false;
  }

  return profile.role === 'admin' && profile.approval_status === 'approved';
}

// Handle member approval/rejection
async function handleMemberApproval(
  supabase: SupabaseClient,
  serviceClient: SupabaseClient,
  payload: ApprovalPayload,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const isApproved = payload.action === 'approve';

  // Update profile status
  const { error: updateError } = await serviceClient
    .from('profiles')
    .update({
      approval_status: isApproved ? 'approved' : 'rejected',
      rejection_reason: isApproved ? null : (payload.rejection_reason ?? 'No reason provided'),
    })
    .eq('id', payload.user_id)
    .eq('approval_status', 'pending'); // Only update if currently pending

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Send notification to the user
  const notificationTitle = isApproved
    ? 'Welcome to The Potential!'
    : 'Registration Update';

  const notificationBody = isApproved
    ? 'Your membership has been approved. Start exploring the community!'
    : `Your registration was not approved. Reason: ${payload.rejection_reason ?? 'No reason provided'}`;

  try {
    await serviceClient.functions.invoke('send-notification', {
      body: {
        user_id: payload.user_id,
        type: isApproved ? 'member_approved' : 'member_rejected',
        title: notificationTitle,
        body: notificationBody,
        metadata: {
          admin_id: adminId,
          action: payload.action,
        },
      },
    });
  } catch (notifyError) {
    console.error('Failed to send notification:', notifyError);
    // Continue even if notification fails
  }

  // Create audit log
  await createAuditLog(serviceClient, {
    action: `member_${payload.action}`,
    admin_id: adminId,
    target_user_id: payload.user_id,
    target_type: 'member',
    approval_action: payload.action,
    details: {
      rejection_reason: payload.rejection_reason,
    },
  });

  return { success: true };
}

// Handle expert approval/rejection
async function handleExpertApproval(
  supabase: SupabaseClient,
  serviceClient: SupabaseClient,
  payload: ApprovalPayload,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const isApproved = payload.action === 'approve';

  // Validate expert_profile_id
  if (!payload.expert_profile_id) {
    return { success: false, error: 'expert_profile_id is required for expert approval' };
  }

  // Update expert profile status
  const { error: updateError } = await serviceClient
    .from('expert_profiles')
    .update({
      status: isApproved ? 'approved' : 'rejected',
      rejection_reason: isApproved ? null : (payload.rejection_reason ?? 'No reason provided'),
      verified_at: isApproved ? new Date().toISOString() : null,
      verified_by: isApproved ? adminId : null,
    })
    .eq('id', payload.expert_profile_id)
    .eq('status', 'pending_review'); // Only update if currently pending review

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // If approved, update the user's role to 'expert'
  if (isApproved) {
    const { error: roleUpdateError } = await serviceClient
      .from('profiles')
      .update({ role: 'expert' })
      .eq('id', payload.user_id);

    if (roleUpdateError) {
      console.error('Failed to update user role:', roleUpdateError);
      // Continue even if role update fails - main approval succeeded
    }
  }

  // Send notification to the user
  const notificationTitle = isApproved
    ? 'Expert Profile Approved!'
    : 'Expert Profile Update';

  const notificationBody = isApproved
    ? 'Congratulations! Your expert profile has been verified. You can now receive collaboration requests.'
    : `Your expert profile was not approved. Reason: ${payload.rejection_reason ?? 'No reason provided'}`;

  try {
    await serviceClient.functions.invoke('send-notification', {
      body: {
        user_id: payload.user_id,
        type: isApproved ? 'expert_approved' : 'expert_rejected',
        title: notificationTitle,
        body: notificationBody,
        reference_type: 'expert_profile',
        reference_id: payload.expert_profile_id,
        metadata: {
          admin_id: adminId,
          action: payload.action,
        },
      },
    });
  } catch (notifyError) {
    console.error('Failed to send notification:', notifyError);
    // Continue even if notification fails
  }

  // Create audit log
  await createAuditLog(serviceClient, {
    action: `expert_${payload.action}`,
    admin_id: adminId,
    target_user_id: payload.user_id,
    target_type: 'expert',
    approval_action: payload.action,
    details: {
      expert_profile_id: payload.expert_profile_id,
      rejection_reason: payload.rejection_reason,
    },
  });

  return { success: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Create client with user's auth token for permission verification
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify admin role
    const isAdmin = await verifyAdmin(supabase, user.id);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const payload: ApprovalPayload = await req.json();

    // Validate required fields
    if (!payload.user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!payload.action || !['approve', 'reject'].includes(payload.action)) {
      return new Response(
        JSON.stringify({ error: 'action must be either "approve" or "reject"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!payload.target || !['member', 'expert'].includes(payload.target)) {
      return new Response(
        JSON.stringify({ error: 'target must be either "member" or "expert"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Rejection requires a reason
    if (payload.action === 'reject' && !payload.rejection_reason) {
      return new Response(
        JSON.stringify({ error: 'rejection_reason is required when rejecting' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create service client for admin operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Process approval based on target type
    let result: { success: boolean; error?: string };

    if (payload.target === 'member') {
      result = await handleMemberApproval(supabase, serviceClient, payload, user.id);
    } else {
      result = await handleExpertApproval(supabase, serviceClient, payload, user.id);
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${payload.target} ${payload.action}${payload.action === 'approve' ? 'd' : 'ed'} successfully`,
        data: {
          user_id: payload.user_id,
          target: payload.target,
          action: payload.action,
          admin_id: user.id,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in approve-member function:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
