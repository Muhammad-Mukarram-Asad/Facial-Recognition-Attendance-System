import { redirect } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';

/** Entry point — the guard bounces to sign-in when there is no session. */
export default function RootPage() {
  redirect(ROUTES.dashboard);
}
