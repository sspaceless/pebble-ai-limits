var C = require('./resources/providers');
var catalog = require('./providers/catalog');

var adapters = {
  codex: require('./providers/codex'),
  claude: require('./providers/claude'),
  gemini: require('./providers/gemini'),
  'claude-api': require('./providers/claude-api'),
  'gemini-api': require('./providers/gemini-api'),
  custom: require('./providers/custom')
};

/** Fetch a normalized snapshot; adapter discovery may enrich the supplied config. */
function usage(id, config, done) {
  var adapter = Object.prototype.hasOwnProperty.call(adapters, id) && adapters[id];

  if (!adapter) {
    return done({ invalidData: true });
  }

  adapter.usage(config, done);
}

/** Renew supported credentials, reporting an authentication error otherwise. */
function renew(id, config, done) {
  var adapter = Object.prototype.hasOwnProperty.call(adapters, id) && adapters[id];

  if (!adapter || !adapter.renew || (id !== C.PROVIDER_CODEX && !config.refreshToken)) {
    return done({ status: C.HTTP_UNAUTHORIZED });
  }

  adapter.renew(config, done);
}

module.exports = {
  catalog: catalog.entries,
  info: catalog.info,
  usage: usage,
  renew: renew,
  parseConfig: require('./providers/credentials'),
  claudeUsage: adapters.claude.normalize,
  geminiUsage: adapters.gemini.normalize,
  claudeCaps: adapters[C.PROVIDER_CLAUDE_API].normalize,
  geminiCaps: adapters[C.PROVIDER_GEMINI_API].normalize,
  customUsage: adapters.custom.normalize
};
