import { redirect } from 'next/navigation';

/**
 * /home now redirects to support-programs.
 * The landing page is now the About page at /.
 * This ensures existing links to /home redirect to the main feature area.
 */
export default async function HomeRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/support-programs`);
}
