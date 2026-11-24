import fs from 'fs';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import NotFound, { metadata } from '../app/not-found';
import { GUIDES } from '../lib/guides';

const html = renderToStaticMarkup(<NotFound />);

// Every route the app serves: each folder under app/ with a page.js, with guide slugs filled in.
function appRoutes() {
  const routes = new Set();
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'page.js') {
        const rel = path.relative(path.join(__dirname, '..', 'app'), dir).split(path.sep).join('/');
        routes.add(`/${rel}`.replace(/\/$/, '') || '/');
      }
    }
  };
  walk(path.join(__dirname, '..', 'app'));
  if (routes.delete('/guides/[slug]')) GUIDES.forEach(g => routes.add(`/guides/${g.slug}`));
  return routes;
}

describe('not-found page', () => {
  test('has exactly one h1 with the heading', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1>This page doesn’t exist<\/h1>/);
    expect(html).toContain('Error 404');
  });

  test('shows the reassurance note with a hidden decorative icon', () => {
    expect(html).toContain('Your saved plan is safe. It lives in this browser, and visiting a missing page doesn’t change it.');
    expect(html).toMatch(/<div class="notice"><svg[^>]*aria-hidden="true"/);
  });

  test('every link points to a route that exists', () => {
    const routes = appRoutes();
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map(m => m[1]);
    expect(hrefs).toEqual(['/planner', '/', '/planner', '/calculators', '/guides', '/budget', '/contact']);
    for (const href of hrefs) expect(routes).toContain(href);
  });

  test('links are real links, not buttons', () => {
    expect(html).not.toMatch(/<button/);
    expect(html).toMatch(/<a class="button" href="\/planner">Go to my plan/);
    expect(html).toMatch(/<a class="button secondary" href="\/">Back to home<\/a>/);
  });

  test('title and robots metadata', () => {
    expect(metadata.title).toBe('Page not found');
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
