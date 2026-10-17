#include "snapshot.h"

static void read_quota(DictionaryIterator *iter, Quota *q, uint32_t left, uint32_t reset,
                       uint32_t value, uint32_t note) {
  Tuple *t = dict_find(iter, left);
  if (t) {
    q->left = t->value->int32 < 0
                  ? QUOTA_UNAVAILABLE
                  : (t->value->int32 > QUOTA_PERCENT_MAX ? QUOTA_PERCENT_MAX : t->value->int32);
  }
  t = dict_find(iter, reset);
  if (t) {
    q->reset = t->value->int32;
  }
  t = dict_find(iter, value);
  if (t && t->type == TUPLE_CSTRING) {
    snprintf(q->value, sizeof(q->value), "%s", t->value->cstring);
  }
  t = dict_find(iter, note);
  if (t && t->type == TUPLE_CSTRING) {
    snprintf(q->note, sizeof(q->note), "%s", t->value->cstring);
  }
}
bool snapshot_apply_message(Snapshot *data, DictionaryIterator *iter) {
  bool account_changed = false;
  Tuple *provider = dict_find(iter, MESSAGE_KEY_PROVIDER);
  Tuple *account_id = dict_find(iter, MESSAGE_KEY_ACCOUNT_ID);
  Tuple *revision = dict_find(iter, MESSAGE_KEY_ACCOUNT_REV);
  if ((provider && provider->value->int32 != data->provider) ||
      (account_id && account_id->type == TUPLE_CSTRING &&
       strcmp(account_id->value->cstring, data->account_id) != 0) ||
      (revision && revision->value->int32 != data->config_revision)) {
    account_changed = true;
    memset(data, 0, sizeof(*data));
    data->primary.left = data->secondary.left = QUOTA_UNAVAILABLE;
    data->provider = provider ? provider->value->int32 : PROVIDER_CODEX;
  }
  if (revision) {
    data->config_revision = revision->value->int32;
  }
  if (account_id && account_id->type == TUPLE_CSTRING) {
    snprintf(data->account_id, sizeof(data->account_id), "%s", account_id->value->cstring);
  }
  Tuple *account_name = dict_find(iter, MESSAGE_KEY_ACCOUNT_NAME);
  if (account_name && account_name->type == TUPLE_CSTRING) {
    snprintf(data->account_name, sizeof(data->account_name), "%s", account_name->value->cstring);
  }
  Tuple *name = dict_find(iter, MESSAGE_KEY_PROVIDER_NAME);
  if (name && name->type == TUPLE_CSTRING) {
    snprintf(data->name, sizeof(data->name), "%s", name->value->cstring);
  }
  Tuple *updated = dict_find(iter, MESSAGE_KEY_UPDATED);
  if (updated) {
    read_quota(iter, &data->primary, MESSAGE_KEY_P_LEFT, MESSAGE_KEY_P_RESET, MESSAGE_KEY_P_VALUE,
               MESSAGE_KEY_P_NOTE);
    read_quota(iter, &data->secondary, MESSAGE_KEY_S_LEFT, MESSAGE_KEY_S_RESET, MESSAGE_KEY_S_VALUE,
               MESSAGE_KEY_S_NOTE);
    data->updated = updated->value->int32;
  }
  return account_changed;
}
