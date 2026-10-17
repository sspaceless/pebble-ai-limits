# C guidance

- Keep controller, snapshot decoding, drawing, and animation responsibilities in their existing modules. Keep drawing free of storage, messaging, and timer side effects.
- Preserve timer and layer ownership: cancel/invalidate callbacks and deinitialize animations before destroying their layer.
- Treat `Snapshot` field order and sizes as persisted-cache layout. Before changing them, assess compatibility and migration needs.
- Use `quota_display_percent()` for displayed percentage semantics so quota rendering and bar animation stay aligned.
- After C changes, run `npm run check` and `.venv/bin/pebble build`; the SDK build compiles all seven configured platforms.
