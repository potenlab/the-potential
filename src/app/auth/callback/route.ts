import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Auth Callback Route Handler
 *
 * Handles OAuth redirects (e.g., Google login) and magic link callbacks from Supabase.
 * After exchanging the auth code for a session, it:
 * 1. Waits for the handle_new_user() trigger to create the profile row.
 * 2. Routes based on onboarding_completed status.
 */

interface ProfileData {
  role: Database['public']['Enums']['user_role'];
  approval_status: Database['public']['Enums']['approval_status'];
  onboarding_completed: boolean;
}

/**
 * Fetches the profile for a given user ID, retrying once if not found
 * (handles rare race with the handle_new_user trigger).
 */
async function fetchProfileWithRetry(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string
): Promise<ProfileData | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, approval_status, onboarding_completed')
    .eq('id', userId)
    .single();

  if (profile) return profile;

  // Trigger may not have finished yet — wait briefly and retry once
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { data: retryProfile } = await supabase
    .from('profiles')
    .select('role, approval_status, onboarding_completed')
    .eq('id', userId)
    .single();

  return retryProfile;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/support-programs';

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ko';

  // Handle OAuth error params (e.g., user cancelled on Google consent screen)
  const oauthError = searchParams.get('error');
  if (oauthError) {
    return NextResponse.redirect(`${origin}/${locale}?auth_error=true`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}?auth_error=true`);
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/${locale}?auth_error=true`);
  }

  const user = data.user;

  // Fetch profile (the handle_new_user trigger auto-creates it on signup)
  const profile = await fetchProfileWithRetry(supabase, user.id);

  if (!profile) {
    // Profile still not found after retry — redirect to onboarding
    // (onboarding form will handle saving to the profile row)
    return NextResponse.redirect(`${origin}/${locale}/signup/onboarding`);
  }

  // If onboarding not completed → go to onboarding
  if (!profile.onboarding_completed) {
    return NextResponse.redirect(`${origin}/${locale}/signup/onboarding`);
  }

  // Onboarding complete: auto-approve if still pending
  if (profile.approval_status !== 'approved') {
    await supabase
      .from('profiles')
      .update({ approval_status: 'approved' })
      .eq('id', user.id);
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    return NextResponse.redirect(`${origin}/${locale}/admin`);
  }

  return NextResponse.redirect(`${origin}/${locale}${next}`);
}
