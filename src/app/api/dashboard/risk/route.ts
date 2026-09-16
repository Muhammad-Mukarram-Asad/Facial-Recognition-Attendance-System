import { riskList } from '@/server/data/seed';
import { handleRouteError, ok } from '@/server/lib/response';

export async function GET() {
  try {
    return ok(riskList);
  } catch (error) {
    return handleRouteError(error);
  }
}
