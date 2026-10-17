#pragma once

/** Provider IDs are shared with the phone protocol; never reorder or renumber. */
typedef enum {
  PROVIDER_CODEX = 0,
  PROVIDER_CLAUDE = 1,
  PROVIDER_GEMINI_CLI = 2,
  PROVIDER_CLAUDE_API = 3,
  PROVIDER_GEMINI_API = 4,
  PROVIDER_CUSTOM = 5
} Provider;
