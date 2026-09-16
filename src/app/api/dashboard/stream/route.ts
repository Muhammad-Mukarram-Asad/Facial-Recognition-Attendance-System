import { clockInStream } from '@/server/data/seed';
import { handleRouteError, ok } from '@/server/lib/response';

export async function GET() {
  try {
    return ok(clockInStream);
  } catch (error) {
    return handleRouteError(error);
  }
}
