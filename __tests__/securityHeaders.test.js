import { describe, expect, test } from '@jest/globals';
import { contentSecurityPolicy, securityHeaders } from '../lib/securityHeaders';

const nextConfig = require('../next.config');

const header = (list, key) => list.find(h => h.key === key)?.value;

describe('security headers', () => {
  test('production policy blocks outside scripts, connections and framing', () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self';");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('upgrade-insecure-requests');
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toMatch(/https?:/);
  });

  test('development adds only what hot reload needs', () => {
    const csp = contentSecurityPolicy({ dev: true });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('ws:');
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  test('every expected header is present', () => {
    const list = securityHeaders();
    for (const key of [
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Cross-Origin-Opener-Policy',
    ]) {
      expect(header(list, key)).toBeTruthy();
    }
    expect(header(list, 'X-Frame-Options')).toBe('DENY');
  });

  test('next.config applies the headers to every route and hides x-powered-by', async () => {
    const rules = await nextConfig.headers();
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe('/:path*');
    expect(header(rules[0].headers, 'Content-Security-Policy')).toBeTruthy();
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
