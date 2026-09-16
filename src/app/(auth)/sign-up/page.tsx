import { redirect } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';

// HIDDEN — self-service sign-up is switched off. Accounts are provisioned by
// the backend team and handed to the client, so there is no public sign-up.
// The SignUpForm component and POST /api/auth/sign-up are intact; to bring
// the flow back, restore ROUTES.signUp, the link in SignInForm, and the
// original render below.
//
// import type { Metadata } from 'next';
// import { SignUpForm } from '@/features/auth/components/SignUpForm';
//
// export const metadata: Metadata = { title: 'Create account — FaceTrack' };
//
// export default function SignUpPage() {
//   return <SignUpForm />;
// }

/** Anyone landing on /sign-up is sent to sign-in. */
export default function SignUpPage() {
  redirect(ROUTES.signIn);
}
