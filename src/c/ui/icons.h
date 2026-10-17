#pragma once

#include <pebble.h>

#include "../model/providers.h"

/** Allocate shared paths once on window load, before drawing icons. */
void icons_init(void);
/** Release paths on window unload, after drawing has stopped. */
void icons_deinit(void);
/** Draw a provider mark at (x, y); unknown IDs use a question-mark fallback.
 * @param ctx Borrowed Pebble drawing context; colors may be changed.
 */
void icons_draw_provider(GContext *ctx, int32_t provider, int x, int y);
/** Draw a 12-pixel sync mark; angle uses Pebble TRIG_MAX_ANGLE units.
 * @param ctx Borrowed Pebble drawing context; fill color may be changed.
 */
void icons_draw_sync(GContext *ctx, int32_t angle, int x, int y);
