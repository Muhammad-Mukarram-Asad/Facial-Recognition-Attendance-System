import type { NextRequest } from 'next/server';

import { handleRouteError, created } from '@/server/lib/response';
import { signUpSchema } from '@/features/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = signUpSchema.parse(await request.json());

    return created({
      token: `ft_${Buffer.from(body.email).toString('base64url')}`,
      user: {
        id: `usr-${body.employeeId.toLowerCase()}`,
        name: `${body.firstName} ${body.lastName}`,
        email: body.email,
        role: 'Attendance Administrator',
        employeeId: body.employeeId,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
