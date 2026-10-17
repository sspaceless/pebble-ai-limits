#include "watch_animation.h"

// Animation timers are owned by the loaded window, independently of messaging.
enum { BAR_DURATION_MS = 640, BAR_FRAME_MS = 40, SYNC_FRAME_MS = 80, SYNC_FRAME_COUNT = 12 };
static Layer *s_layer;
static AppTimer *s_bar_timer, *s_sync_timer;
static uint16_t s_bar_elapsed;
static uint32_t s_bar_generation, s_sync_generation;
static uint16_t s_bar_progress = ANIMATION_PROGRESS_MAX;
static bool s_updating;
static uint8_t s_sync_frame;
static int32_t s_sync_angle;

// A cancelled callback must not advance a newer animation.
static void sync_frame(void *context) {
  if ((uintptr_t)context != s_sync_generation || !s_updating) {
    return;
  }
  s_sync_timer = NULL;
  s_sync_frame = (s_sync_frame + 1) % SYNC_FRAME_COUNT;
  s_sync_angle = s_sync_frame * TRIG_MAX_ANGLE / SYNC_FRAME_COUNT;
  if (s_layer) {
    layer_mark_dirty(s_layer);
  }
  s_sync_timer =
      app_timer_register(SYNC_FRAME_MS, sync_frame, (void *)(uintptr_t)s_sync_generation);
}
void watch_animation_set_updating(bool updating) {
  if (s_updating == updating) {
    return;
  }
  s_sync_generation++;
  if (s_sync_timer) {
    app_timer_cancel(s_sync_timer);
  }
  s_sync_timer = NULL;
  s_updating = updating;
  s_sync_frame = 0;
  s_sync_angle = 0;
  if (updating) {
    s_sync_timer =
        app_timer_register(SYNC_FRAME_MS, sync_frame, (void *)(uintptr_t)s_sync_generation);
  }
  if (s_layer) {
    layer_mark_dirty(s_layer);
  }
}
static void animate_bar_frame(void *context) {
  if ((uintptr_t)context != s_bar_generation) {
    return;
  }
  s_bar_timer = NULL;
  s_bar_elapsed += BAR_FRAME_MS;
  if (s_bar_elapsed >= BAR_DURATION_MS) {
    s_bar_progress = ANIMATION_PROGRESS_MAX;
  } else {
    uint32_t remaining = BAR_DURATION_MS - s_bar_elapsed;
    s_bar_progress = ANIMATION_PROGRESS_MAX - remaining * remaining * ANIMATION_PROGRESS_MAX /
                                                  (BAR_DURATION_MS * BAR_DURATION_MS);
    s_bar_timer =
        app_timer_register(BAR_FRAME_MS, animate_bar_frame, (void *)(uintptr_t)s_bar_generation);
  }
  layer_mark_dirty(s_layer);
}

void watch_animation_stop_bars(void) {
  s_bar_generation++;
  if (s_bar_timer) {
    app_timer_cancel(s_bar_timer);
  }
  s_bar_timer = NULL;
  s_bar_progress = ANIMATION_PROGRESS_MAX;
}

void watch_animation_start_bars(const Snapshot *data) {
  watch_animation_stop_bars();
  if ((data->primary.left <= 0 || data->primary.value[0]) &&
      (data->secondary.left <= 0 || data->secondary.value[0])) {
    return;
  }
  s_bar_elapsed = 0;
  s_bar_progress = 0;
  layer_mark_dirty(s_layer);
  s_bar_timer =
      app_timer_register(BAR_FRAME_MS, animate_bar_frame, (void *)(uintptr_t)s_bar_generation);
}

void watch_animation_init(Layer *layer) {
  s_layer = layer;
}

void watch_animation_deinit(void) {
  watch_animation_stop_bars();
  watch_animation_set_updating(false);
  s_layer = NULL;
}

uint16_t watch_animation_progress(void) {
  return s_bar_progress;
}

int32_t watch_animation_angle(void) {
  return s_sync_angle;
}

bool watch_animation_is_updating(void) {
  return s_updating;
}
