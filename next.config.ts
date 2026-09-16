import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,

  /**
   * Retired routes.
   *
   * These run before routing, so a direct hit never renders the console shell
   * first — unlike a `redirect()` inside the page, which can only take effect
   * after the layout has already streamed.
   *
   * Both are temporary; delete the entry to bring the flow back.
   */
  async redirects() {
    return [
      // Self-service sign-up is off — accounts are provisioned by the backend team.
      { source: '/sign-up', destination: '/sign-in', permanent: false },
      // Leave management is hidden for this release.
      { source: '/leave-requests', destination: '/dashboard', permanent: false },
    ];
  },
};

export default nextConfig;
