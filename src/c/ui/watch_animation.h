#pragma once

#include "../model/snapshot.h"

enum { ANIMATION_PROGRESS_MAX = 1000 };

/** Bind animations to a live layer. Call before starting any animation. */
void watch_animation_init(Layer *layer);
/** Cancel owned timers before destroying the bound layer. */
void watch_animation_deinit(void);
/** Start/stop sync rotation; repeated calls with the same state preserve its frame. */
void watch_animation_set_updating(bool updating);
/** Restart bar easing for percentage quotas; absolute caps do not animate.
 * @param data Borrowed snapshot, read only during this call.
 */
void watch_animation_start_bars(const Snapshot *data);
/** Cancel bar easing, invalidate pending frames, and restore full progress. */
void watch_animation_stop_bars(void);
/** @return Bar fill scale in [0, ANIMATION_PROGRESS_MAX]. */
uint16_t watch_animation_progress(void);
/** @return Current sync rotation in Pebble TRIG_MAX_ANGLE units. */
int32_t watch_animation_angle(void);
/** @return Whether sync rotation is active. */
bool watch_animation_is_updating(void);
