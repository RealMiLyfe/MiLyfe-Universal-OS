/**
 * Cron Authentication Helper
 *
 * Validates that an incoming cron request is authorized.
 * Supports both:
 * 1. Standard Vercel Cron header: Authorization: Bearer <CRON_SECRET>
 * 2. Alternative header: x-cron-secret: <CRON_SECRET>
 */

export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // If no secret is configured in env, deny in production, permit only in explicit test mode
    return false;
  }

  // 1. Check Authorization: Bearer <secret>
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer' && parts[1] === secret) {
      return true;
    }
  }

  // 2. Check x-cron-secret header
  const customHeader = request.headers.get('x-cron-secret');
  if (customHeader && customHeader === secret) {
    return true;
  }

  return false;
}
