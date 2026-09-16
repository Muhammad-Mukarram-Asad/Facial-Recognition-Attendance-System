import type { NextRequest } from 'next/server';

import { forgotPasswordSchema } from '@/features/auth/types';
import { handleRouteError, ok } from '@/server/lib/response';

export async function POST(request: NextRequest) {
  try {
    const { email } = forgotPasswordSchema.parse(await request.json());

    // Always reports success: confirming whether an address is registered
    // would let anyone enumerate staff accounts.
    return ok({
      sent: true,
      email,
      message: 'If that account exists, a reset link has been sent.',
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
