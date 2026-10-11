/**
 * HTTP security headers for every route (used by next.config.js).
 *
 * The site has no backend, so the goal is to protect what lives in the
 * visitor's browser: only our own scripts may run, nothing can send data to
 * another site, and nobody can frame the pages.
 *
 * script-src keeps 'unsafe-inline' because Next.js streams inline bootstrap
 * scripts on statically generated pages. A nonce would force every page to be
 * rendered on demand. External scripts and connections are still blocked.
 * 'unsafe-eval' is only added in development (React refresh needs it).
 */

function contentSecurityPolicy({ dev = false } = {}) {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(dev ? ['ws:'] : [])],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
  };
  const parts = Object.entries(directives).map(([k, v]) => `${k} ${v.join(' ')}`);
  if (!dev) parts.push('upgrade-insecure-requests');
  return parts.join('; ');
}

function securityHeaders({ dev = false } = {}) {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy({ dev }) },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), hid=(), browsing-topics=()',
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  ];
}

module.exports = { contentSecurityPolicy, securityHeaders };
