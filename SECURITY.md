# Security

ByeByeBalance runs entirely in your browser. There are no accounts, no database and no server code. Plans, budgets and check-ins are stored in your browser's local storage on your device and are never sent to us.

## Reporting a problem

Please report security issues privately through [GitHub's private vulnerability reporting](https://github.com/Kwamib/ByeByeBalance/security/advisories/new) rather than a public issue. Include the page, the steps to reproduce and what you expected to happen. You'll get a reply as soon as possible.

## What the site does to protect you

- A strict Content Security Policy: only the site's own scripts run, pages can't send data to other sites, and the site can't be loaded inside another site's frame.
- HTTPS only (HSTS), plus nosniff, referrer and permissions policies.
- Backup files are size-limited and fully validated before anything is changed.
- CSV exports neutralize spreadsheet formulas.
- Dependencies are checked weekly by Dependabot and `npm audit` in review.
