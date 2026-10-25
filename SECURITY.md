# Security Policy

First Move runs in the browser. Project data stays in the user's browser (IndexedDB) and never
leaves it: the Content Security Policy allows connections only to the site's own origin, except on
dashboard pages, where it also allows the two AI providers the user can connect with their own key
(`openrouter.ai` and `ai-gateway.vercel.sh`) — contacts the browser makes only when the user uses
the assistant or starts an AI Plan Score. Reports about how that promise could be broken are the
most valuable ones.

Two server-side pieces exist for the email agent: the inbound webhook and the consent endpoint
under `/api/mail/`, which receive and answer e-mail. They process no project data and no browser
storage.

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

- Cross-site scripting or any other way to run attacker-controlled script on the site — including
  through AI-generated text (chat, email, extracted values) or a crafted project file.
- Anything that sends project data over the network, or reads it from another origin.
- The AI layers: the bring-your-own-key assistant and AI Plan Score (key handling, the PIN vault,
  values applied to a project without the user's confirmation), and the email agent (webhook
  signature, consent flow, prompt injection through inbound mail, reply routing, the store's
  encryption).
- Weaknesses in the security headers or the Content Security Policy.
- Leaked secrets in the repository or its history.

## Known and accepted

Reviewed design decisions a report does not need to repeat:

- The consent confirm link of the email agent is a **bearer token**: whoever holds it can confirm.
  It enables only the processing of the sender's own pending mail, and replies go only to the
  authenticated sender address, so a forwarded link exposes nothing. The token lives in the URL
  fragment, is single-use, signed and expires after 7 days.
- The daily e-mail budget is **checked before a run, counted after it** (check-then-act): fully
  concurrent runs can overshoot the default budget by small change. The per-sender and global rate
  limits bound this, and the spending limit on the provider key is the hard cap.
- The human@ relay and the operator hand-off **attach the original message** (≤ 15 MB) to mail to
  the operator's mailbox, guarded (machine mail and the project's own addresses dropped, a daily
  cap, Reply-To to the sender only when DMARC passed, sanitized cover text).
- Project data is stored unencrypted in the browser by design; the assistant's remembered keys are
  the exception (encrypted, PIN-locked).

## Out of scope

- Findings that need a modified browser, a malicious extension, or physical access to the
  user's device.
- Missing rate limits or denial-of-service tests against the hosting platform.
- Reports from automated scanners without a demonstrated impact.
- The content of the legal pages. Send those through the contact page as ordinary feedback.

Please do not test against other people's data, and do not run load tests against the live site.
