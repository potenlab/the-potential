import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Auth Callback Route Handler
 *
 * Handles OAuth redirects (e.g., Google login) from Supabase.
 * After exchanging the auth code for a session, it:
 * 1. Checks if the user has a profile in the profiles table.
 * 2. If no profile exists (first-time Google user), creates one with approval_status: 'pending'.
 * 3. If the user's approval_status is NOT 'approved', signs them out and redirects
 *    to the landing page with a ?pending=true query param.
 * 4. Only allows access (redirect to /home or /admin) if approval_status === 'approved'.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

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
        .select('role, approval_status')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // First-time user (Google OAuth or Magic Link): create a profile with pending approval
        const metadata = user.user_metadata || {};
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: metadata.full_name || metadata.name || null,
            avatar_url: metadata.avatar_url || metadata.picture || null,
            company_name: metadata.company_name || null,
            position: metadata.position || null,
            role: 'member',
            approval_status: 'pending',
          });

        if (insertError) {
          // If insert fails (e.g., trigger already created the row), try to fetch again
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('role, approval_status')
            .eq('id', user.id)
            .single();

          if (retryProfile && retryProfile.approval_status === 'approved') {
            if (retryProfile.role === 'admin') {
              return NextResponse.redirect(`${origin}/admin`);
            }
            return NextResponse.redirect(`${origin}${next}`);
          }
        }

        // New user is always pending -- sign them out and redirect
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/${locale}?pending=true`);
      }

      // Existing profile: check approval status
      if (profile.approval_status !== 'approved') {
        // Not approved -- sign the user out so they don't retain a session
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/${locale}?pending=true`);
      }

      // Approved user: redirect based on role
      if (profile.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's no code, redirect with error
  return NextResponse.redirect(`${origin}/${locale}?auth_error=true`);
}
