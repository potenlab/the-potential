import { redirect } from 'next/navigation';

/**
 * Root page (/) redirects to /support-programs.
 * The About page is now at /about.
 */
export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/support-programs`);
}
