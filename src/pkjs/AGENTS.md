# JavaScript companion guidance

- Keep companion code and serialized WebView code distinct. WebView factories run as ES5 in a separate environment: pass browser modules explicitly, and do not rely on CommonJS imports or companion storage there.
- Keep application constants in the canonical `resources/shared/` definitions and expose only the values a module uses through its resource view.
- Bind asynchronous account work to account identity and revision. Preserve the existing stale-response, cancellation, and atomic-save behavior when changing account or settings flows.
- Keep provider-specific requests in provider adapters and response parsing side-effect free; shared HTTP and account storage should not acquire unrelated provider dependencies.
- After JavaScript changes, run `npm run check`. For login, settings, or account lifecycle changes, add or update a test that exercises the serialized browser flow or companion integration path involved.
