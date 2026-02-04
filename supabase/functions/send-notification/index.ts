// supabase/functions/send-notification/index.ts
// Edge Function to create notifications and optionally send push/email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Notification types matching the database enum
type NotificationType =
  | 'member_approved'
  | 'member_rejected'
  | 'expert_approved'
  | 'expert_rejected'
  | 'new_comment'
  | 'new_like'
  | 'new_collaboration_request'
  | 'collaboration_accepted'
  | 'collaboration_declined'
  | 'system_announcement';

interface NotificationPayload {
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string;
  reference_type?: string;
  reference_id?: string;
  metadata?: Record<string, unknown>;
}

interface AuditLogEntry {
  action: string;
  user_id: string;
  notification_id?: number;
  timestamp: string;
  details: Record<string, unknown>;
}

// In-memory audit trail (in production, this would be persisted to a table)
const auditLog: AuditLogEntry[] = [];

function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>) {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  auditLog.push(logEntry);
  console.log('[AUDIT]', JSON.stringify(logEntry));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const payload: NotificationPayload = await req.json();

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

    if (!payload.type) {
      return new Response(
        JSON.stringify({ error: 'type is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!payload.title) {
      return new Response(
        JSON.stringify({ error: 'title is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify that the target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', payload.user_id)
      .single();

    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert notification into database
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? null,
        reference_type: payload.reference_type ?? null,
        reference_id: payload.reference_id ?? null,
        metadata: payload.metadata ?? {},
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert notification:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log the audit trail
    logAudit({
      action: 'notification_created',
      user_id: payload.user_id,
      notification_id: notification.id,
      details: {
        type: payload.type,
        title: payload.title,
        reference_type: payload.reference_type,
        reference_id: payload.reference_id,
      },
    });

    // TODO: Add push notification integration (e.g., Firebase Cloud Messaging)
    // TODO: Add email notification integration (e.g., Resend, SendGrid)
    // Example:
    // if (shouldSendEmail(payload.type)) {
    //   await sendEmail({
    //     to: targetUser.email,
    //     subject: payload.title,
    //     body: payload.body,
    //   });
    // }

    return new Response(
      JSON.stringify({
        success: true,
        data: notification,
        message: 'Notification created successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-notification function:', error);

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
