#include "quota_view.h"

#include "icons.h"
#include "watch_animation.h"

enum { STALE_AFTER_MINUTES = 10, QUOTA_ROW_HEIGHT = 51, BAR_TOP = 29, BAR_HEIGHT = 5 };

static void text(GContext *ctx, GRect rect, const char *value, const char *font) {
  graphics_draw_text(ctx, value, fonts_get_system_font(font), rect,
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
}

static void countdown(int32_t reset, char *buffer, size_t size) {
  if (!reset) {
    snprintf(buffer, size, "Reset unknown");
    return;
  }
  int32_t delta = reset - (int32_t)time(NULL);
  if (delta <= 0) {
    snprintf(buffer, size, "Awaiting update");
    return;
  }
  int32_t minutes = (delta + SECONDS_PER_MINUTE - 1) / SECONDS_PER_MINUTE;
  if (minutes >= MINUTES_PER_DAY) {
    snprintf(buffer, size, "%ldd %ldh", (long)(minutes / MINUTES_PER_DAY),
             (long)(minutes % MINUTES_PER_DAY / MINUTES_PER_HOUR));
  } else {
    snprintf(buffer, size, "%ldh %ldm", (long)(minutes / MINUTES_PER_HOUR),
             (long)(minutes % MINUTES_PER_HOUR));
  }
}

static void quota(GContext *ctx, const Quota *q, int32_t provider, uint16_t progress, int y,
                  int row_height, int width, int margin) {
  char value[64];
  int32_t display_percent = q->left;
  // Claude Code and Gemini CLI show quota consumed; Codex shows allowance remaining.
  if (!q->value[0] && q->left >= 0 &&
      (provider == PROVIDER_CLAUDE || provider == PROVIDER_GEMINI_CLI)) {
    display_percent = QUOTA_PERCENT_MAX - q->left;
  }
  if (q->value[0]) {
    snprintf(value, sizeof(value), "%s", q->value);
  } else if (q->left < 0) {
    snprintf(value, sizeof(value), "--");
  } else {
    snprintf(value, sizeof(value), "%ld%%", (long)display_percent);
  }
  int content_y = y + (row_height - QUOTA_ROW_HEIGHT) / 2;
  text(ctx, GRect(0, content_y - 4, width, 34), value, FONT_KEY_GOTHIC_28_BOLD);
  int bar_width = width - 2 * margin;
  graphics_context_set_stroke_color(ctx, PBL_IF_COLOR_ELSE(GColorLightGray, GColorBlack));
  if (!q->value[0]) {
    graphics_draw_rect(ctx, GRect(margin, content_y + BAR_TOP, bar_width, BAR_HEIGHT));
  }
  graphics_context_set_fill_color(ctx, GColorBlack);
  if (display_percent >= 0 && !q->value[0]) {
    graphics_fill_rect(
        ctx,
        GRect(margin, content_y + BAR_TOP,
              bar_width * display_percent * progress / (QUOTA_PERCENT_MAX * ANIMATION_PROGRESS_MAX),
              BAR_HEIGHT),
        0, GCornerNone);
  }
  if (q->note[0]) {
    if (q->reset) {
      char remaining[24];
      countdown(q->reset, remaining, sizeof(remaining));
      snprintf(value, sizeof(value), "%s %s", q->note, remaining);
    } else {
      snprintf(value, sizeof(value), "%s", q->note);
    }
  } else {
    countdown(q->reset, value, sizeof(value));
  }
  text(ctx, GRect(margin, content_y + 35, width - 2 * margin, 18), value, FONT_KEY_GOTHIC_14);
}

void quota_view_draw(Layer *layer, GContext *ctx, const Snapshot *data, int32_t account_count,
                     bool connected, bool updating, const char *status, uint16_t progress,
                     int32_t sync_angle) {
  GRect bounds = layer_get_bounds(layer);
  int width = bounds.size.w, height = bounds.size.h;
  graphics_context_set_fill_color(ctx, GColorWhite);
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);
  graphics_context_set_text_color(ctx, GColorBlack);
  int top = PBL_IF_ROUND_ELSE(9, 0);
  GFont header_font = fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD);
  GSize title_size = graphics_text_layout_get_content_size(
      data->name, header_font, GRect(0, 0, PBL_IF_ROUND_ELSE(80, width - 32), 20),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft);
  int header_x = (width - title_size.w - 20) / 2;
  icons_draw_provider(ctx, data->provider, header_x, top + 3);
  graphics_draw_text(ctx, data->name, header_font, GRect(header_x + 18, top, title_size.w + 2, 20),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  bool show_account_name = account_count > 1 && data->account_name[0];
  if (show_account_name) {
    text(ctx, GRect(20, top + 17, width - 40, 18), data->account_name, FONT_KEY_GOTHIC_14);
  }
  int first = top + (show_account_name ? 36 : 22);
  int footer_y = height - PBL_IF_ROUND_ELSE(26, 19);
  int row_height = (footer_y - first) / 2;
  int margin = PBL_IF_ROUND_ELSE(26, 10);
  quota(ctx, &data->primary, data->provider, progress, first, row_height, width, margin);
  quota(ctx, &data->secondary, data->provider, progress, first + row_height, row_height, width,
        margin);
  char footer[40];
  bool show_sync = false;
  if (!connected) {
    snprintf(footer, sizeof(footer), "Phone disconnected");
  } else if (updating) {
    show_sync = true;
    if (data->updated) {
      int32_t age = ((int32_t)time(NULL) - data->updated) / SECONDS_PER_MINUTE;
      if (age < 0) {
        age = 0;
      }
      snprintf(footer, sizeof(footer), "%ldm ago", (long)age);
    } else {
      footer[0] = '\0';
    }
  } else if (status[0] && strcmp(status, "Configured caps") != 0) {
    snprintf(footer, sizeof(footer), "%s", status);
  } else if (!data->updated) {
    snprintf(footer, sizeof(footer), "Waiting for phone");
  } else {
    int32_t age = ((int32_t)time(NULL) - data->updated) / SECONDS_PER_MINUTE;
    if (age < 0) {
      age = 0;
    }
    snprintf(footer, sizeof(footer), "%s%ldm ago", age >= STALE_AFTER_MINUTES ? "Stale: " : "",
             (long)age);
    show_sync = true;
  }
  if (show_sync) {
    if (!footer[0]) {
      icons_draw_sync(ctx, sync_angle, (width - 12) / 2, footer_y + 3);
      return;
    }
    GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_14);
    GSize size = graphics_text_layout_get_content_size(footer, font, GRect(0, 0, width - 32, 19),
                                                       GTextOverflowModeTrailingEllipsis,
                                                       GTextAlignmentLeft);
    int x = (width - size.w - 16) / 2;
    icons_draw_sync(ctx, sync_angle, x, footer_y + 3);
    graphics_draw_text(ctx, footer, font, GRect(x + 16, footer_y, size.w + 1, 19),
                       GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  } else {
    text(ctx, GRect(PBL_IF_ROUND_ELSE(30, 3), footer_y, width - PBL_IF_ROUND_ELSE(60, 6), 19),
         footer, FONT_KEY_GOTHIC_14);
  }
}
