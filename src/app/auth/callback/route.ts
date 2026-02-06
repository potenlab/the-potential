import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Auth Callback Route Handler
 *
 * Handles OAuth redirects (e.g., Google login) and magic link callbacks from Supabase.
 * After exchanging the auth code for a session, it:
 * 1. Checks if the user has a profile in the profiles table.
 * 2. If new user or onboarding NOT completed -> redirect to /signup/onboarding
 * 3. If onboarding completed -> auto-approve and redirect to /home or /admin
 */

interface ProfileData {
  role: Database['public']['Enums']['user_role'];
  approval_status: Database['public']['Enums']['approval_status'];
  company_name: string | null;
  onboarding_completed: boolean;
}

/**
 * Routes the user based on their profile status.
 */
async function handleProfileRouting(
  profile: ProfileData,
  origin: string,
  locale: string,
  next: string,
  supabase: ReturnType<typeof createServerClient<Database>>
) {
  // Check if onboarding is done
  if (!profile.onboarding_completed) {
    return NextResponse.redirect(`${origin}/${locale}/signup/onboarding`);
  }

  // Onboarding complete: auto-approve if not yet approved
  if (profile.approval_status !== 'approved') {
    await supabase
      .from('profiles')
      .update({ approval_status: 'approved' })
      .eq('id', (await supabase.auth.getUser()).data.user!.id);
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    return NextResponse.redirect(`${origin}/${locale}/admin`);
  }
  return NextResponse.redirect(`${origin}/${locale}${next}`);
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

  if (code) {

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

    if (error) {
      return NextResponse.redirect(`${origin}/${locale}?auth_error=true`);
    }

    if (data.user) {
      const user = data.user;

      // Check if the user already has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approval_status, company_name, onboarding_completed')
        .eq('id', user.id)
        .single();

      const metadata = user.user_metadata || {};

      if (!profile) {
        // First-time user: trigger may have created a basic profile, or we create one
        const hasCompanyFromSignup = !!metadata.company_name;

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: metadata.full_name || metadata.name || null,
            avatar_url: metadata.avatar_url || metadata.picture || null,
            company_name: metadata.company_name || null,
            role: 'member',
            approval_status: 'pending',
          });

        if (insertError) {
          // If insert fails (e.g., trigger already created the row), update with metadata
          // This handles the case where handle_new_user trigger created a basic profile
          if (hasCompanyFromSignup) {
            await supabase
              .from('profiles')
              .update({
                full_name: metadata.full_name || metadata.name || undefined,
                company_name: metadata.company_name || undefined,
                avatar_url: metadata.avatar_url || metadata.picture || undefined,
              })
              .eq('id', user.id);
          }

          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('role, approval_status, company_name, onboarding_completed')
            .eq('id', user.id)
            .single();

          if (retryProfile) {
            return handleProfileRouting(retryProfile, origin, locale, next, supabase);
          }
        }

        // New user -> redirect to onboarding
        return NextResponse.redirect(`${origin}/${locale}/signup/onboarding`);
      }

      // For existing profiles: if user has metadata from magic link signup but profile
      // is missing company_name, update the profile first
      if (!profile.company_name && metadata.company_name) {
        await supabase
          .from('profiles')
          .update({
            full_name: metadata.full_name || metadata.name || undefined,
            company_name: metadata.company_name || undefined,
          })
          .eq('id', user.id);

        // Refresh profile data
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('role, approval_status, company_name, onboarding_completed')
          .eq('id', user.id)
          .single();

        if (updatedProfile) {
          return handleProfileRouting(updatedProfile, origin, locale, next, supabase);
        }
      }

      return handleProfileRouting(profile, origin, locale, next, supabase);
    }
  }

  // If there's no code, redirect with error
  return NextResponse.redirect(`${origin}/${locale}?auth_error=true`);
}
