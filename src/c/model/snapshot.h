#pragma once

#include <pebble.h>

#include "providers.h"

enum { QUOTA_UNAVAILABLE = -1, QUOTA_PERCENT_MAX = 100 };

/** Persisted layout: retain field order, integer types, and sizes for existing caches. */
typedef struct {
  int32_t left;  /**< Remaining percentage, or QUOTA_UNAVAILABLE. */
  int32_t reset; /**< Unix seconds, or zero when unknown. */
  char value[16], note[24];
} Quota;
typedef struct {
  Quota primary, secondary;
  int32_t updated, provider, config_revision;
  char name[32], account_id[48], account_name[64];
} Snapshot;

/** Apply a partial phone message without storage, timer, or drawing side effects.
 * Missing fields retain their values, except an account/provider/revision change
 * clears the old snapshot first. Quotas update only with an UPDATED field.
 * @param data Mutable snapshot; no pointer is retained.
 * @param iter Incoming Pebble dictionary, borrowed for the duration of the call.
 * @return Whether account identity changed and previous animations must stop.
 */
bool snapshot_apply_message(Snapshot *data, DictionaryIterator *iter);
