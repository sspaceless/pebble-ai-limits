#pragma once

#include "../model/snapshot.h"

/** Draw the full screen without storage, messaging, or timer side effects.
 * @param layer Live drawing layer, used for screen bounds.
 * @param ctx Borrowed drawing context; graphics state may be changed.
 * @param data Borrowed read-only snapshot; strings must be null-terminated.
 * @param account_count Number of profiles; names are hidden for a single profile.
 * @param connected Whether the paired phone app is reachable.
 * @param updating Whether to display the synchronization indicator.
 * @param status Null-terminated status; an empty string uses the snapshot age.
 * @param progress Bar scale in [0, ANIMATION_PROGRESS_MAX].
 * @param sync_angle Rotation in Pebble TRIG_MAX_ANGLE units.
 * All pointers are borrowed during this call; icon paths must be initialized.
 */
void quota_view_draw(Layer *layer, GContext *ctx, const Snapshot *data, int32_t account_count,
                     bool connected, bool updating, const char *status, uint16_t progress,
                     int32_t sync_angle);
