# Skill: Chatbot Debug

## Purpose

Diagnose and fix Aliasist homepage chatbot issues without breaking auth or RAG
fallback behavior.

## Inputs

- User-visible error text.
- Affected domain or repo.
- Recent deploy or secret changes, if known.

## Preconditions

- For `aliasist.com`, work in `/home/blake/aliasistabductor`.
- For Waterfall chat on `aliasist.tech`, work in `/home/blake/aliasist-tech`.
- Confirm whether the issue is local, deployed, or live.

## Tool Steps

1. Inspect chat UI callsites.
2. Inspect Pages Functions or Worker handlers.
3. Check auth/session helpers before changing request body reads.
4. Verify fallback endpoints and env names.
5. Run targeted tests plus functions build when available.

## Failure Modes

- Reading a request body twice without `clone()` or `tee()`.
- Mixing Clerk publishable keys and secret keys.
- Treating a frontend CAPTCHA event as server-side verification.
- Confusing homepage chat with Waterfall chat.

## Done Criteria

- Root cause is identified.
- Fix is scoped.
- Chat path builds/tests locally.
- Remaining deploy or secret steps are explicit.

