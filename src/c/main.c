#include <pebble.h>

#include "ui/icons.h"
#include "ui/quota_view.h"
#include "ui/watch_animation.h"

static Window *s_window;
static Layer *s_layer;
static Snapshot s_data = {.primary = {.left = QUOTA_UNAVAILABLE},
                          .secondary = {.left = QUOTA_UNAVAILABLE},
                          .name = "Codex"};
static char s_status[40] = "Open app settings";
static bool s_connected;
static int32_t s_account_count = 1;
static AppTimer *s_timeout;
enum {
  CACHE_KEY = 4,
  CACHE_KEY_ACCOUNT_COUNT = 5,
  NAVIGATION_RETRY_MS = 200,
  PHONE_TIMEOUT_MS = 30000,
  REFRESH_INTERVAL_MINUTES = 5,
  INBOX_SIZE_BYTES = 512,
  OUTBOX_SIZE_BYTES = 64
};
static AppTimer *s_navigation_retry;
static int8_t s_pending_navigation;

static void draw(Layer *layer, GContext *ctx) {
  quota_view_draw(layer, ctx, &s_data, s_account_count, s_connected, watch_animation_is_updating(),
                  s_status, watch_animation_progress(), watch_animation_angle());
}

static void timed_out(void *context) {
  s_timeout = NULL;
  watch_animation_set_updating(false);
  snprintf(s_status, sizeof(s_status), "Phone not responding");
  layer_mark_dirty(s_layer);
}
static void retry_pending_navigation(void *context);
static void schedule_navigation_retry(void) {
  if (s_pending_navigation && !s_navigation_retry) {
    s_navigation_retry = app_timer_register(NAVIGATION_RETRY_MS, retry_pending_navigation, NULL);
  }
}
static void request_direction(int direction) {
  DictionaryIterator *iter;
  int8_t navigation = direction ? direction : s_pending_navigation;
  if (app_message_outbox_begin(&iter) != APP_MSG_OK) {
    if (navigation) {
      s_pending_navigation = navigation;
    }
    schedule_navigation_retry();
    return;
  }
  dict_write_uint8(iter, MESSAGE_KEY_REQUEST, 1);
  if (navigation) {
    dict_write_int8(iter, MESSAGE_KEY_NAV, navigation);
  }
  if (app_message_outbox_send() == APP_MSG_OK) {
    if (navigation && navigation == s_pending_navigation) {
      s_pending_navigation = 0;
    }
    s_status[0] = '\0';
    watch_animation_set_updating(true);
    if (s_timeout) {
      app_timer_cancel(s_timeout);
    }
    s_timeout = app_timer_register(PHONE_TIMEOUT_MS, timed_out, NULL);
    layer_mark_dirty(s_layer);
  } else {
    if (navigation) {
      s_pending_navigation = navigation;
    }
    schedule_navigation_retry();
  }
}
static void retry_pending_navigation(void *context) {
  s_navigation_retry = NULL;
  if (s_pending_navigation) {
    request_direction(s_pending_navigation);
  }
}
static void request(void) {
  request_direction(0);
}
static void click(ClickRecognizerRef recognizer, void *context) {
  request();
}
static void up(ClickRecognizerRef recognizer, void *context) {
  request_direction(-1);
}
static void down(ClickRecognizerRef recognizer, void *context) {
  request_direction(1);
}
static void clicks(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, click);
  window_single_click_subscribe(BUTTON_ID_UP, up);
  window_single_click_subscribe(BUTTON_ID_DOWN, down);
}
static void tick(struct tm *tick_time, TimeUnits changed) {
  layer_mark_dirty(s_layer);
  if (tick_time->tm_min % REFRESH_INTERVAL_MINUTES == 0 && s_connected &&
      !watch_animation_is_updating()) {
    request();
  }
}
static void connection(bool connected) {
  s_connected = connected;
  if (!connected) {
    watch_animation_set_updating(false);
  }
  layer_mark_dirty(s_layer);
  if (connected) {
    request();
  }
}
static void received(DictionaryIterator *iter, void *context) {
  int32_t previous_updated = s_data.updated;
  int32_t previous_primary = s_data.primary.left;
  int32_t previous_secondary = s_data.secondary.left;
  bool account_changed = false;
  Tuple *loading = dict_find(iter, MESSAGE_KEY_UPDATING);
  bool incoming_updating = loading && loading->value->int32 != 0;
  if (!incoming_updating && s_timeout) {
    app_timer_cancel(s_timeout);
    s_timeout = NULL;
  }
  account_changed = snapshot_apply_message(&s_data, iter);
  if (account_changed) {
    watch_animation_stop_bars();
  }
  Tuple *account_count = dict_find(iter, MESSAGE_KEY_ACCOUNT_COUNT);
  if (account_count && account_count->value->int32 > 0) {
    s_account_count = account_count->value->int32;
    persist_write_int(CACHE_KEY_ACCOUNT_COUNT, s_account_count);
  }
  Tuple *updated = dict_find(iter, MESSAGE_KEY_UPDATED);
  if (updated) {
    persist_write_data(CACHE_KEY, &s_data, sizeof(s_data));
    s_status[0] = '\0';
    if (account_changed || s_data.updated != previous_updated ||
        s_data.primary.left != previous_primary || s_data.secondary.left != previous_secondary) {
      watch_animation_start_bars(&s_data);
    }
  }
  Tuple *status = dict_find(iter, MESSAGE_KEY_STATUS);
  if (status && status->type == TUPLE_CSTRING) {
    snprintf(s_status, sizeof(s_status), "%s", status->value->cstring);
  }
  if (loading) {
    watch_animation_set_updating(incoming_updating);
  } else if (updated) {
    watch_animation_set_updating(false);
  }
  if (!strcmp(s_status, "Updating...")) {
    s_status[0] = '\0';
    watch_animation_set_updating(true);
  }
  layer_mark_dirty(s_layer);
  schedule_navigation_retry();
}
static void failed(DictionaryIterator *iter, AppMessageResult reason, void *context) {
  watch_animation_set_updating(false);
  snprintf(s_status, sizeof(s_status), "Phone unavailable");
  layer_mark_dirty(s_layer);
}
static void load(Window *window) {
  icons_init();
  s_layer = layer_create(layer_get_bounds(window_get_root_layer(window)));
  watch_animation_init(s_layer);
  layer_set_update_proc(s_layer, draw);
  layer_add_child(window_get_root_layer(window), s_layer);
  watch_animation_start_bars(&s_data);
}
static void unload(Window *window) {
  if (s_navigation_retry) {
    app_timer_cancel(s_navigation_retry);
  }
  s_navigation_retry = NULL;
  s_pending_navigation = 0;
  watch_animation_deinit();
  layer_destroy(s_layer);
  s_layer = NULL;
  icons_deinit();
}
int main(void) {
  if (persist_get_size(CACHE_KEY) == sizeof(s_data)) {
    persist_read_data(CACHE_KEY, &s_data, sizeof(s_data));
    s_status[0] = '\0';
  }
  if (persist_exists(CACHE_KEY_ACCOUNT_COUNT)) {
    int32_t saved_count = persist_read_int(CACHE_KEY_ACCOUNT_COUNT);
    if (saved_count > 0) {
      s_account_count = saved_count;
    }
  }
  s_connected = connection_service_peek_pebble_app_connection();
  s_window = window_create();
  window_set_background_color(s_window, GColorWhite);
  window_set_window_handlers(s_window, (WindowHandlers){.load = load, .unload = unload});
  window_set_click_config_provider(s_window, clicks);
  window_stack_push(s_window, true);
  app_message_register_inbox_received(received);
  app_message_register_outbox_failed(failed);
  app_message_open(INBOX_SIZE_BYTES, OUTBOX_SIZE_BYTES);
  connection_service_subscribe((ConnectionHandlers){.pebble_app_connection_handler = connection});
  tick_timer_service_subscribe(MINUTE_UNIT, tick);
  app_event_loop();
  if (s_timeout) {
    app_timer_cancel(s_timeout);
  }
  tick_timer_service_unsubscribe();
  connection_service_unsubscribe();
  window_destroy(s_window);
}
