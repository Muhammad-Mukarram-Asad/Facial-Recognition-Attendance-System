import type { NextRequest } from 'next/server';

import { badRequest, handleRouteError, ok } from '@/server/lib/response';
import { signInSchema } from '@/features/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = signInSchema.parse(await request.json());

    // Mock auth: any well-formed credential pair is accepted. Swap this
    // for the real identity provider without touching the client.
    if (body.password.length < 4) {
      return badRequest('That email and password combination was not recognised', 'INVALID_CREDENTIALS');
    }

    const name = body.email.split('@')[0].split('.').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    return ok({
      token: `ft_${Buffer.from(body.email).toString('base64url')}`,
      user: {
        id: 'usr-admin-1',
        name: name || 'FaceTrack Admin',
        email: body.email,
        role: 'Attendance Administrator',
        employeeId: 'LTM-00001',
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
