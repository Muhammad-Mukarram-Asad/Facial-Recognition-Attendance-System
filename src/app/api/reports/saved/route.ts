import { savedReports } from '@/server/data/seed';
import { handleRouteError, ok } from '@/server/lib/response';

export async function GET() {
  try {
    return ok(savedReports);
  } catch (error) {
    return handleRouteError(error);
  }
}
