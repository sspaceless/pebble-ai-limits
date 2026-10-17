#include "icons.h"

enum { GEMINI_PART_COUNT = 4, CODEX_MARK_HEIGHT = 16 };

static GPath *s_sync_arrow;
static GPath *s_gemini[GEMINI_PART_COUNT];
static const GPathInfo GEMINI_PARTS[GEMINI_PART_COUNT] = {
    {4, (GPoint[]){{7, 0}, {9, 5}, {7, 7}, {5, 5}}},
    {4, (GPoint[]){{14, 7}, {9, 9}, {7, 7}, {9, 5}}},
    {4, (GPoint[]){{7, 14}, {5, 9}, {7, 7}, {9, 9}}},
    {4, (GPoint[]){{0, 7}, {5, 5}, {7, 7}, {5, 9}}}};
static const GPathInfo SYNC_ARROW = {.num_points = 10,
                                     .points = (GPoint[]){{-5, -1},
                                                          {-4, -3},
                                                          {-2, -5},
                                                          {1, -5},
                                                          {3, -4},
                                                          {5, -6},
                                                          {5, -1},
                                                          {0, -1},
                                                          {2, -3},
                                                          {-1, -3}}};
static const int8_t CODEX_CLOUD_SPANS[CODEX_MARK_HEIGHT][2] = {
    {-1, -1}, {7, 8},  {5, 10}, {4, 11}, {3, 12}, {2, 13}, {2, 13}, {1, 14},
    {1, 14},  {1, 14}, {2, 14}, {2, 13}, {3, 12}, {4, 11}, {6, 9},  {-1, -1}};
#if defined(PBL_COLOR)
static const uint32_t CODEX_CLOUD_COLORS[CODEX_MARK_HEIGHT] = {
    0,        0xa99af4, 0xa294f4, 0x9a8ef4, 0x9188f5, 0x8882f6, 0x7f7cf8, 0x7676f9,
    0x6d70fb, 0x656afb, 0x5d64fc, 0x555efc, 0x4d58fc, 0x4653fc, 0x4350fc, 0};
#endif

void icons_draw_provider(GContext *ctx, int32_t provider, int x, int y) {
  if (provider == PROVIDER_GEMINI_CLI || provider == PROVIDER_GEMINI_API) {
    GColor colors[] = {PBL_IF_COLOR_ELSE(GColorFromHEX(0x4285f4), GColorBlack),
                       PBL_IF_COLOR_ELSE(GColorFromHEX(0x9162e4), GColorBlack),
                       PBL_IF_COLOR_ELSE(GColorFromHEX(0xc76ad9), GColorBlack),
                       PBL_IF_COLOR_ELSE(GColorFromHEX(0x6ea9f7), GColorBlack)};
    for (int i = 0; i < GEMINI_PART_COUNT; i++) {
      if (s_gemini[i]) {
        graphics_context_set_fill_color(ctx, colors[i]);
        gpath_move_to(s_gemini[i], GPoint(x, y));
        gpath_draw_filled(ctx, s_gemini[i]);
      }
    }
    return;
  }
  if (provider == PROVIDER_CLAUDE || provider == PROVIDER_CLAUDE_API) {
    graphics_context_set_fill_color(ctx, PBL_IF_COLOR_ELSE(GColorFromHEX(0xd97757), GColorBlack));
    graphics_fill_rect(ctx, GRect(x + 3, y + 3, 8, 6), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x, y + 1, 3, 5), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 11, y + 1, 3, 5), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 1, y + 5, 3, 2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 10, y + 5, 3, 2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 4, y + 9, 2, 4), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 8, y + 9, 2, 4), 0, GCornerNone);
    graphics_context_set_fill_color(ctx, PBL_IF_COLOR_ELSE(GColorBlack, GColorWhite));
    graphics_fill_rect(ctx, GRect(x + 5, y + 4, 1, 2), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(x + 8, y + 4, 1, 2), 0, GCornerNone);
    return;
  }
  if (provider == PROVIDER_CODEX) {
    for (int row = 0; row < CODEX_MARK_HEIGHT; row++) {
      int left = CODEX_CLOUD_SPANS[row][0], right = CODEX_CLOUD_SPANS[row][1];
      if (left < 0) {
        continue;
      }
      graphics_context_set_fill_color(
          ctx, PBL_IF_COLOR_ELSE(GColorFromHEX(CODEX_CLOUD_COLORS[row]), GColorBlack));
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
  graphics_draw_text(ctx, provider == PROVIDER_CUSTOM ? "A" : "?",
                     fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD), GRect(x, y - 2, 14, 17),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  graphics_context_set_text_color(ctx, GColorBlack);
}

void icons_draw_sync(GContext *ctx, int32_t angle, int x, int y) {
  if (!s_sync_arrow) {
    return;
  }
  graphics_context_set_fill_color(ctx, GColorBlack);
  // Two opposing arrows stay legible at the footer's 12-pixel size.
  gpath_move_to(s_sync_arrow, GPoint(x + 6, y + 6));
  gpath_rotate_to(s_sync_arrow, angle);
  gpath_draw_filled(ctx, s_sync_arrow);
  gpath_rotate_to(s_sync_arrow, angle + TRIG_MAX_ANGLE / 2);
  gpath_draw_filled(ctx, s_sync_arrow);
}

void icons_init(void) {
  s_sync_arrow = gpath_create(&SYNC_ARROW);
  for (int i = 0; i < GEMINI_PART_COUNT; i++) {
    s_gemini[i] = gpath_create(&GEMINI_PARTS[i]);
  }
}

void icons_deinit(void) {
  gpath_destroy(s_sync_arrow);
  s_sync_arrow = NULL;
  for (int i = 0; i < GEMINI_PART_COUNT; i++) {
    gpath_destroy(s_gemini[i]);
    s_gemini[i] = NULL;
  }
}
