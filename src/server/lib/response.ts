import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ message, code: 'NOT_FOUND' }, { status: 404 });
}

export function badRequest(message: string, code = 'BAD_REQUEST') {
  return NextResponse.json({ message, code }, { status: 400 });
}

/** Turn a thrown error into the { message, code } shape the client expects. */
export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: 'Invalid request payload', code: 'VALIDATION_ERROR', issues: error.issues },
      { status: 422 },
    );
  }
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  return NextResponse.json({ message, code: 'INTERNAL_ERROR' }, { status: 500 });
}
