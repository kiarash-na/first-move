# Security Policy

First Move runs in the browser. It has no backend and no database: project data stays in the
user's browser (IndexedDB) and never leaves it, and the Content Security Policy only allows
requests to the site's own origin (`connect-src 'self'`). Reports about how that promise could
be broken are the most valuable ones.

## Supported versions

Only the latest commit on `main`, which is what runs at <https://firstmove.energy>, is supported.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

1. Use GitHub's private reporting: open the **Security** tab of this repository and choose
   **Report a vulnerability**.
2. Or write through the contact page: <https://kiarash.online/contact>. Say that it is a
   security report for First Move, and leave out details until we have a private channel.

Please include what you found, the page or file it affects, and steps to reproduce it. A
proof of concept helps. Reports are handled by one person on a best-effort basis, so there
is no fixed response time.

## In scope

- Cross-site scripting or any other way to run attacker-controlled script on the site.
- Anything that sends project data over the network, or reads it from another origin.
- Import of a crafted project file that breaks the app or runs code.
- Weaknesses in the security headers or the Content Security Policy.
- Leaked secrets in the repository or its history.

## Out of scope

- Findings that need a modified browser, a malicious extension, or physical access to the
  user's device (project data is stored unencrypted in the browser by design).
- Missing rate limits or denial-of-service tests against the hosting platform.
- Reports from automated scanners without a demonstrated impact.
- The content of the legal pages. Send those through the contact page as ordinary feedback.

Please do not test against other people's data, and do not run load tests against the live site.
