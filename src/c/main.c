#include <pebble.h>

typedef struct { int32_t left, reset; char value[16], note[24]; } Quota;
typedef struct { Quota primary, secondary; int32_t updated, provider, config_revision; char name[32], account_id[48], account_name[64]; } Snapshot;
static Window *s_window;
static Layer *s_layer;
static GPath *s_sync_arrow;
static GPath *s_gemini[4];
static const GPathInfo GEMINI_PARTS[4] = {
  {4, (GPoint[]) {{7,0},{9,5},{7,7},{5,5}}},
  {4, (GPoint[]) {{14,7},{9,9},{7,7},{9,5}}},
  {4, (GPoint[]) {{7,14},{5,9},{7,7},{9,9}}},
  {4, (GPoint[]) {{0,7},{5,5},{7,7},{5,9}}}
};
static const GPathInfo SYNC_ARROW = {
  .num_points = 10,
  .points = (GPoint[]) {{-5,-1},{-4,-3},{-2,-5},{1,-5},{3,-4},
    {5,-6},{5,-1},{0,-1},{2,-3},{-1,-3}}
};
static const int8_t CODEX_CLOUD_SPANS[16][2] = {
  {-1,-1}, {7,8}, {5,10}, {4,11}, {3,12}, {2,13}, {2,13}, {1,14},
  {1,14}, {1,14}, {2,14}, {2,13}, {3,12}, {4,11}, {6,9}, {-1,-1}
};
static const uint32_t CODEX_CLOUD_COLORS[16] = {
  0, 0xa99af4, 0xa294f4, 0x9a8ef4, 0x9188f5,
  0x8882f6, 0x7f7cf8, 0x7676f9, 0x6d70fb,
  0x656afb, 0x5d64fc, 0x555efc, 0x4d58fc,
  0x4653fc, 0x4350fc, 0
};
static Snapshot s_data = { .primary = {.left = -1}, .secondary = {.left = -1}, .name = "Codex" };
static char s_status[40] = "Open app settings";
static bool s_connected;
static int32_t s_account_count = 1;
static AppTimer *s_timeout;
static AppTimer *s_bar_timer;
static uint16_t s_bar_elapsed;
static uint32_t s_bar_generation;
static uint16_t s_bar_progress = 1000;
#define BAR_DURATION_MS 640
#define BAR_FRAME_MS 40
#define CACHE_KEY 4
#define CACHE_KEY_ACCOUNT_COUNT 5
static AppTimer *s_sync_timer, *s_navigation_retry;
static int8_t s_pending_navigation;
static bool s_updating;
static uint8_t s_sync_frame;
static int32_t s_sync_angle;
static uint32_t s_sync_generation;

static void sync_frame(void *context) {
  if ((uintptr_t)context != s_sync_generation || !s_updating) return;
  s_sync_timer = NULL;
  s_sync_frame = (s_sync_frame + 1) % 12;
  s_sync_angle = s_sync_frame * TRIG_MAX_ANGLE / 12;
  if (s_layer) layer_mark_dirty(s_layer);
  s_sync_timer = app_timer_register(80, sync_frame, (void *)(uintptr_t)s_sync_generation);
}
static void set_updating(bool updating) {
  if (s_updating == updating) return;
  s_sync_generation++;
  if (s_sync_timer) app_timer_cancel(s_sync_timer);
  s_sync_timer = NULL; s_updating = updating; s_sync_frame = 0; s_sync_angle = 0;
  if (updating) s_sync_timer = app_timer_register(80, sync_frame, (void *)(uintptr_t)s_sync_generation);
  if (s_layer) layer_mark_dirty(s_layer);
}
static void animate_bar_frame(void *context) {
  if ((uintptr_t)context != s_bar_generation) return;
  s_bar_timer = NULL;
  s_bar_elapsed += BAR_FRAME_MS;
  if (s_bar_elapsed >= BAR_DURATION_MS) {
    s_bar_progress = 1000;
  } else {
    uint32_t remaining = BAR_DURATION_MS - s_bar_elapsed;
    s_bar_progress = 1000 - remaining * remaining * 1000 / (BAR_DURATION_MS * BAR_DURATION_MS);
    s_bar_timer = app_timer_register(BAR_FRAME_MS, animate_bar_frame, (void *)(uintptr_t)s_bar_generation);
  }
  layer_mark_dirty(s_layer);
}

static void stop_bar_animation(void) {
  s_bar_generation++;
  if (s_bar_timer) app_timer_cancel(s_bar_timer);
  s_bar_timer = NULL;
  s_bar_progress = 1000;
}

static void animate_bars(void) {
  stop_bar_animation();
  if ((s_data.primary.left <= 0 || s_data.primary.value[0]) &&
      (s_data.secondary.left <= 0 || s_data.secondary.value[0])) return;
  s_bar_elapsed = 0;
  s_bar_progress = 0;
  layer_mark_dirty(s_layer);
  s_bar_timer = app_timer_register(BAR_FRAME_MS, animate_bar_frame, (void *)(uintptr_t)s_bar_generation);
}

static void text(GContext *ctx, GRect rect, const char *value, const char *font) {
  graphics_draw_text(ctx, value, fonts_get_system_font(font), rect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
}

static void codex_mark(GContext *ctx, int x, int y) {
  if (s_data.provider == 2 || s_data.provider == 4) {
    GColor colors[] = {PBL_IF_COLOR_ELSE(GColorFromHEX(0x4285f4), GColorBlack),
      PBL_IF_COLOR_ELSE(GColorFromHEX(0x9162e4), GColorBlack),
      PBL_IF_COLOR_ELSE(GColorFromHEX(0xc76ad9), GColorBlack),
      PBL_IF_COLOR_ELSE(GColorFromHEX(0x6ea9f7), GColorBlack)};
    for (int i = 0; i < 4; i++) if (s_gemini[i]) {
      graphics_context_set_fill_color(ctx, colors[i]);
      gpath_move_to(s_gemini[i], GPoint(x, y)); gpath_draw_filled(ctx, s_gemini[i]);
    }
    return;
  }
  if (s_data.provider == 1 || s_data.provider == 3) {
    graphics_context_set_fill_color(ctx, PBL_IF_COLOR_ELSE(GColorFromHEX(0xd97757), GColorBlack));
    graphics_fill_rect(ctx, GRect(x+3,y+3,8,6), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x,y+1,3,5), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x+11,y+1,3,5), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x+1,y+5,3,2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x+10,y+5,3,2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x+4,y+9,2,4), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x+8,y+9,2,4), 0, GCornerNone);
    graphics_context_set_fill_color(ctx, PBL_IF_COLOR_ELSE(GColorBlack, GColorWhite));
    graphics_fill_rect(ctx, GRect(x+5,y+4,1,2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x+8,y+4,1,2), 0, GCornerNone);
    return;
  }
  if (s_data.provider == 0) {
    for (int row = 0; row < 16; row++) {
      int left = CODEX_CLOUD_SPANS[row][0], right = CODEX_CLOUD_SPANS[row][1];
      if (left < 0) continue;
      graphics_context_set_fill_color(ctx, PBL_IF_COLOR_ELSE(
        GColorFromHEX(CODEX_CLOUD_COLORS[row]), GColorBlack));
      graphics_fill_rect(ctx, GRect(x + left, y + row, right - left + 1, 1), 0, GCornerNone);
    }
    graphics_context_set_fill_color(ctx, GColorWhite);
    // Terminal prompt: a compact chevron and underscore cut into the cloud.
    graphics_fill_rect(ctx, GRect(x + 4, y + 5, 2, 2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 5, y + 7, 3, 2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 4, y + 9, 2, 2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 8, y + 9, 4, 2), 1, GCornersAll);
    return;
  }
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(x, y, 14, 14), 3, GCornersAll);
  graphics_context_set_text_color(ctx, GColorWhite);
  text(ctx, GRect(x, y - 2, 14, 17), s_data.provider == 5 ? "A" : "?", FONT_KEY_GOTHIC_14_BOLD);
  graphics_context_set_text_color(ctx, GColorBlack);
}

static void sync_mark(GContext *ctx, int x, int y) {
  if (!s_sync_arrow) return;
  graphics_context_set_fill_color(ctx, GColorBlack);
  // Two opposing arrows stay legible at the footer's 12-pixel size.
  gpath_move_to(s_sync_arrow, GPoint(x+6,y+6));
  gpath_rotate_to(s_sync_arrow, s_sync_angle);
  gpath_draw_filled(ctx, s_sync_arrow);
  gpath_rotate_to(s_sync_arrow, s_sync_angle + TRIG_MAX_ANGLE / 2);
  gpath_draw_filled(ctx, s_sync_arrow);
}

static void countdown(int32_t reset, char *buffer, size_t size) {
  if (!reset) { snprintf(buffer, size, "Reset unknown"); return; }
  int32_t delta = reset - (int32_t)time(NULL);
  if (delta <= 0) { snprintf(buffer, size, "Awaiting update"); return; }
  int32_t minutes = (delta + 59) / 60;
  if (minutes >= 1440) snprintf(buffer, size, "%ldd %ldh", (long)(minutes / 1440), (long)(minutes % 1440 / 60));
  else snprintf(buffer, size, "%ldh %ldm", (long)(minutes / 60), (long)(minutes % 60));
}

static void quota(GContext *ctx, Quota *q, int y, int row_height, int width, int margin) {
  char value[64];
  int32_t display_percent=q->left;
  // Claude Code and Gemini CLI show quota consumed; Codex shows allowance remaining.
  if (!q->value[0] && q->left >= 0 && (s_data.provider == 1 || s_data.provider == 2)) display_percent=100-q->left;
  if (q->value[0]) snprintf(value, sizeof(value), "%s", q->value);
  else if (q->left < 0) snprintf(value, sizeof(value), "--");
  else snprintf(value, sizeof(value), "%ld%%", (long)display_percent);
  int content_y = y + (row_height - 51) / 2;
  text(ctx, GRect(0, content_y - 4, width, 34), value, FONT_KEY_GOTHIC_28_BOLD);
  int bar_width = width - 2 * margin;
  graphics_context_set_stroke_color(ctx, PBL_IF_COLOR_ELSE(GColorLightGray, GColorBlack));
  if (!q->value[0]) graphics_draw_rect(ctx, GRect(margin, content_y + 29, bar_width, 5));
  graphics_context_set_fill_color(ctx, GColorBlack);
  if (display_percent >= 0 && !q->value[0]) graphics_fill_rect(ctx, GRect(margin, content_y + 29, bar_width * display_percent * s_bar_progress / 100000, 5), 0, GCornerNone);
  if (q->note[0]) {
    if (q->reset) {
      char remaining[24]; countdown(q->reset, remaining, sizeof(remaining));
      snprintf(value, sizeof(value), "%s %s", q->note, remaining);
    } else snprintf(value, sizeof(value), "%s", q->note);
  } else countdown(q->reset, value, sizeof(value));
  text(ctx, GRect(margin, content_y + 35, width - 2 * margin, 18), value, FONT_KEY_GOTHIC_14);
}

static void draw(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  int width = bounds.size.w, height = bounds.size.h;
  graphics_context_set_fill_color(ctx, GColorWhite);
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);
  graphics_context_set_text_color(ctx, GColorBlack);
  int top = PBL_IF_ROUND_ELSE(9, 0);
  GFont header_font = fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD);
  GSize title_size = graphics_text_layout_get_content_size(s_data.name, header_font, GRect(0, 0, PBL_IF_ROUND_ELSE(80, width - 32), 20), GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft);
  int header_x = (width - title_size.w - 20) / 2;
  codex_mark(ctx, header_x, top + 3);
  graphics_draw_text(ctx, s_data.name, header_font, GRect(header_x + 18, top, title_size.w + 2, 20), GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  bool show_account_name = s_account_count > 1 && s_data.account_name[0];
  if (show_account_name) text(ctx, GRect(20, top + 17, width - 40, 18), s_data.account_name, FONT_KEY_GOTHIC_14);
  int first = top + (show_account_name ? 36 : 22);
  int footer_y = height - PBL_IF_ROUND_ELSE(26, 19);
  int row_height = (footer_y - first) / 2;
  int margin = PBL_IF_ROUND_ELSE(26, 10);
  quota(ctx, &s_data.primary, first, row_height, width, margin);
  quota(ctx, &s_data.secondary, first + row_height, row_height, width, margin);
  char footer[40];
  bool show_sync = false;
  if (!s_connected) snprintf(footer, sizeof(footer), "Phone disconnected");
  else if (s_updating) {
    show_sync = true;
    if (s_data.updated) {
      int32_t age = ((int32_t)time(NULL)-s_data.updated)/60; if (age < 0) age = 0;
      snprintf(footer,sizeof(footer),"%ldm ago",(long)age);
    } else footer[0] = '\0';
  }
  else if (s_status[0] && strcmp(s_status, "Configured caps") != 0) snprintf(footer, sizeof(footer), "%s", s_status);
  else if (!s_data.updated) snprintf(footer, sizeof(footer), "Waiting for phone");
  else {
    int32_t age = ((int32_t)time(NULL) - s_data.updated) / 60;
    if (age < 0) age = 0;
    snprintf(footer, sizeof(footer), "%s%ldm ago", age >= 10 ? "Stale: " : "", (long)age);
    show_sync = true;
  }
  if (show_sync) {
    if (!footer[0]) {sync_mark(ctx,(width-12)/2,footer_y+3);return;}
    GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_14);
    GSize size = graphics_text_layout_get_content_size(footer, font, GRect(0, 0, width - 32, 19), GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft);
    int x = (width - size.w - 16) / 2;
    sync_mark(ctx, x, footer_y + 3);
    graphics_draw_text(ctx, footer, font, GRect(x + 16, footer_y, size.w + 1, 19), GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  } else {
    text(ctx, GRect(PBL_IF_ROUND_ELSE(30, 3), footer_y, width - PBL_IF_ROUND_ELSE(60, 6), 19), footer, FONT_KEY_GOTHIC_14);
  }
}

static void timed_out(void *context) {
  s_timeout = NULL;
  set_updating(false);
  snprintf(s_status, sizeof(s_status), "Phone not responding");
  layer_mark_dirty(s_layer);
}
static void retry_pending_navigation(void *context);
static void schedule_navigation_retry(void) {
  if (s_pending_navigation && !s_navigation_retry) s_navigation_retry = app_timer_register(200, retry_pending_navigation, NULL);
}
static void request_direction(int direction) {
  DictionaryIterator *iter;
  int8_t navigation = direction ? direction : s_pending_navigation;
  if (app_message_outbox_begin(&iter) != APP_MSG_OK) {
    if (navigation) s_pending_navigation = navigation;
    schedule_navigation_retry(); return;
  }
  dict_write_uint8(iter, MESSAGE_KEY_REQUEST, 1);
  if (navigation) dict_write_int8(iter, MESSAGE_KEY_NAV, navigation);
  if (app_message_outbox_send() == APP_MSG_OK) {
    if (navigation && navigation == s_pending_navigation) s_pending_navigation = 0;
    s_status[0] = '\0'; set_updating(true);
    if (s_timeout) app_timer_cancel(s_timeout);
    s_timeout = app_timer_register(30000, timed_out, NULL);
    layer_mark_dirty(s_layer);
  } else {
    if (navigation) s_pending_navigation = navigation;
    schedule_navigation_retry();
  }
}
static void retry_pending_navigation(void *context) {
  s_navigation_retry = NULL;
  if (s_pending_navigation) request_direction(s_pending_navigation);
}
static void request(void) {request_direction(0);}
static void click(ClickRecognizerRef recognizer, void *context) {request();}
static void up(ClickRecognizerRef recognizer, void *context) {request_direction(-1);}
static void down(ClickRecognizerRef recognizer, void *context) {request_direction(1);}
static void clicks(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, click);
  window_single_click_subscribe(BUTTON_ID_UP, up);
  window_single_click_subscribe(BUTTON_ID_DOWN, down);
}
static void tick(struct tm *tick_time, TimeUnits changed) {
  layer_mark_dirty(s_layer);
  if (tick_time->tm_min % 5 == 0 && s_connected && !s_updating) request();
}
static void connection(bool connected) {
  s_connected = connected;
  if (!connected) set_updating(false);
  layer_mark_dirty(s_layer);
  if (connected) request();
}
static void read_quota(DictionaryIterator *iter, Quota *q, uint32_t left, uint32_t reset, uint32_t value, uint32_t note) {
  Tuple *t = dict_find(iter, left);
  if (t) q->left = t->value->int32 < 0 ? -1 : (t->value->int32 > 100 ? 100 : t->value->int32);
  t = dict_find(iter, reset); if (t) q->reset = t->value->int32;
  t = dict_find(iter, value); if (t && t->type == TUPLE_CSTRING) snprintf(q->value, sizeof(q->value), "%s", t->value->cstring);
  t = dict_find(iter, note); if (t && t->type == TUPLE_CSTRING) snprintf(q->note, sizeof(q->note), "%s", t->value->cstring);
}
static void received(DictionaryIterator *iter, void *context) {
  int32_t previous_updated = s_data.updated;
  int32_t previous_primary = s_data.primary.left;
  int32_t previous_secondary = s_data.secondary.left;
  bool account_changed = false;
  Tuple *loading = dict_find(iter, MESSAGE_KEY_UPDATING);
  bool incoming_updating = loading && loading->value->int32 != 0;
  if (!incoming_updating && s_timeout) {app_timer_cancel(s_timeout); s_timeout = NULL;}
  Tuple *provider = dict_find(iter, MESSAGE_KEY_PROVIDER);
  Tuple *account_id = dict_find(iter, MESSAGE_KEY_ACCOUNT_ID);
  Tuple *revision = dict_find(iter, MESSAGE_KEY_ACCOUNT_REV);
  if ((provider && provider->value->int32 != s_data.provider) ||
      (account_id && account_id->type == TUPLE_CSTRING && strcmp(account_id->value->cstring, s_data.account_id) != 0) ||
      (revision && revision->value->int32 != s_data.config_revision)) {
    account_changed = true;
    stop_bar_animation();
    memset(&s_data, 0, sizeof(s_data));
    s_data.primary.left = s_data.secondary.left = -1;
    s_data.provider = provider ? provider->value->int32 : 0;
  }
  if (revision) s_data.config_revision = revision->value->int32;
  if (account_id && account_id->type == TUPLE_CSTRING) snprintf(s_data.account_id, sizeof(s_data.account_id), "%s", account_id->value->cstring);
  Tuple *account_name = dict_find(iter, MESSAGE_KEY_ACCOUNT_NAME);
  if (account_name && account_name->type == TUPLE_CSTRING) snprintf(s_data.account_name, sizeof(s_data.account_name), "%s", account_name->value->cstring);
  Tuple *account_count = dict_find(iter, MESSAGE_KEY_ACCOUNT_COUNT);
  if (account_count && account_count->value->int32 > 0) {
    s_account_count = account_count->value->int32;
    persist_write_int(CACHE_KEY_ACCOUNT_COUNT, s_account_count);
  }
  Tuple *name = dict_find(iter, MESSAGE_KEY_PROVIDER_NAME);
  if (name && name->type == TUPLE_CSTRING) snprintf(s_data.name, sizeof(s_data.name), "%s", name->value->cstring);
  Tuple *updated = dict_find(iter, MESSAGE_KEY_UPDATED);
  if (updated) {
    read_quota(iter, &s_data.primary, MESSAGE_KEY_P_LEFT, MESSAGE_KEY_P_RESET, MESSAGE_KEY_P_VALUE, MESSAGE_KEY_P_NOTE);
    read_quota(iter, &s_data.secondary, MESSAGE_KEY_S_LEFT, MESSAGE_KEY_S_RESET, MESSAGE_KEY_S_VALUE, MESSAGE_KEY_S_NOTE);
    s_data.updated = updated->value->int32;
    persist_write_data(CACHE_KEY, &s_data, sizeof(s_data));
    s_status[0] = '\0';
    if (account_changed || s_data.updated != previous_updated ||
        s_data.primary.left != previous_primary || s_data.secondary.left != previous_secondary) animate_bars();
  }
  Tuple *status = dict_find(iter, MESSAGE_KEY_STATUS);
  if (status && status->type == TUPLE_CSTRING) snprintf(s_status, sizeof(s_status), "%s", status->value->cstring);
  if (loading) set_updating(incoming_updating);
  else if (updated) set_updating(false);
  if (!strcmp(s_status,"Updating...")) {s_status[0]='\0';set_updating(true);}
  layer_mark_dirty(s_layer);
  schedule_navigation_retry();
}
static void failed(DictionaryIterator *iter, AppMessageResult reason, void *context) {
  set_updating(false);
  snprintf(s_status, sizeof(s_status), "Phone unavailable");
  layer_mark_dirty(s_layer);
}
static void load(Window *window) {
  s_sync_arrow = gpath_create(&SYNC_ARROW);
  for (int i=0;i<4;i++) s_gemini[i]=gpath_create(&GEMINI_PARTS[i]);
  s_layer = layer_create(layer_get_bounds(window_get_root_layer(window)));
  layer_set_update_proc(s_layer, draw);
  layer_add_child(window_get_root_layer(window), s_layer);
  animate_bars();
}
static void unload(Window *window) {
  if (s_navigation_retry) { app_timer_cancel(s_navigation_retry); }
  s_navigation_retry=NULL; s_pending_navigation=0;
  stop_bar_animation();set_updating(false);
  layer_destroy(s_layer);s_layer=NULL;gpath_destroy(s_sync_arrow);
  for(int i=0;i<4;i++)gpath_destroy(s_gemini[i]);
}
int main(void) {
  if (persist_get_size(CACHE_KEY) == sizeof(s_data)) {persist_read_data(CACHE_KEY, &s_data, sizeof(s_data)); s_status[0] = '\0';}
  if (persist_exists(CACHE_KEY_ACCOUNT_COUNT)) {
    int32_t saved_count = persist_read_int(CACHE_KEY_ACCOUNT_COUNT);
    if (saved_count > 0) s_account_count = saved_count;
  }
  s_connected = connection_service_peek_pebble_app_connection();
  s_window = window_create();
  window_set_background_color(s_window, GColorWhite);
  window_set_window_handlers(s_window, (WindowHandlers){.load = load, .unload = unload});
  window_set_click_config_provider(s_window, clicks);
  window_stack_push(s_window, true);
  app_message_register_inbox_received(received);
  app_message_register_outbox_failed(failed);
  app_message_open(512, 64);
  connection_service_subscribe((ConnectionHandlers){.pebble_app_connection_handler = connection});
  tick_timer_service_subscribe(MINUTE_UNIT, tick);
  app_event_loop();
  if (s_timeout) app_timer_cancel(s_timeout);
  tick_timer_service_unsubscribe();
  connection_service_unsubscribe();
  window_destroy(s_window);
}
