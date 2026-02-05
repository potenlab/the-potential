import { redirect } from 'next/navigation';

/**
 * /home now redirects to the locale root (/) where the landing page lives.
 * This ensures existing links to /home still work.
 */
export default async function HomeRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}`);
}
