# Performance review

Reviewed on 18 October 2026: profile storage and queries, refresh coordination,
watch delivery, shared HTTP, Google quota pagination, settings serialization,
watch controller, rendering, and animation timers.

## Optimized work

Each profile-store load parses the full JSON document, including every account's
credentials and cached quota. Nested queries repeated this work on refresh,
navigation, settings composition, and message delivery.

| Operation (initialized profile store) | Before | After |
| --- | --- | --- |
| `accounts.current()` | 2 storage loads/JSON parses | 1 |
| `accounts.view()` | 3 storage loads/JSON parses | 1 |
| Empty outbox flush after acknowledgement | 2 storage loads/JSON parses | 0 |

Queries now resolve selection against the state already loaded by the operation.
ID lookup stops on the first match rather than allocating a filtered array;
public views map the saved array without an intermediate copy. The outbox checks
for a queued message before resolving the current account. Account ID/revision
validation still runs immediately before sending each queued message.

Deterministic tests enforce the operation counts, selection fallback, fresh reads
after selection changes, credential-free views, and rejection of stale delivery.
Existing companion integration tests cover renewal, deletion, reconnection,
settings commits, and slow-delivery coalescing. These counts measure removed work,
not elapsed-time or battery improvements on a physical phone.

No process-wide profile cache was added: callers mutate loaded records before
committing, and asynchronous jobs require fresh revision checks. Each public
query continues to load current persisted state independently.

## Other reviewed paths and limits

Refresh already reuses active jobs per account and revision. The delivery queue
already coalesces pending messages. Google quota pagination is bounded by page
count; accumulation copies remain a possible target if real responses demonstrate
material cost. Settings factory serialization runs when opening pages rather than
on animation frames.

Watch countdown ticks run once per minute, refresh runs every five minutes, and
bar animation stops after 640 ms. Sync rotation redraws the full view every 80 ms
while updating; rendering includes text layout and formatting on those frames.
This remains a candidate for device profiling before introducing extra layers or
render caches. Repeated watch persistence writes are another possible follow-up.

This review did not measure provider latency, phone WebView startup, watch frame
times, memory peaks, or battery use on hardware. No claim of an end-to-end speedup
or hardware performance verification is made.

## Release size

The SDK bundle measured 603,323 bytes, including a 285,923-byte source map, and
stored its ZIP entries without compression. Release packaging externalizes that
map and deflates the remaining entries, producing 88,901 bytes (85.3% smaller).
All seven watch platforms remain present; executable JS and C payloads are
unchanged. This reduces transfer size without claiming reduced runtime memory or
battery usage. Physical installation of this compressed package remains unverified.
