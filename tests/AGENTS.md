# Test guidance

- Use Node's built-in `node:test` runner and keep tests deterministic with local fixtures, fake clocks, and stubbed network/browser APIs.
- For WebView behavior, run the serialized browser factories in a VM so tests exercise the same ES5 source and explicit dependencies used by the phone.
- Test observable contracts such as account isolation, cancellation, expiry, escaped markup, and saved state; avoid duplicating implementation details in assertions.
- Keep normal tests offline and credential-free. Live provider checks belong to the explicit `npm run check:direct` and `npm run check:gemini` commands.
- Run the focused test file while iterating, then `npm run check` before completing a code change. Update `docs/verification.md` when test coverage or verification claims change.
