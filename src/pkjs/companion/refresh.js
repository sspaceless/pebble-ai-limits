var C = require('../resources/companion/refresh');
var accounts = require('../accounts');
var providers = require('../providers');
var messages = require('./watch-messages');

var status = messages.status;
var statusFor = messages.statusFor;
var deliver = messages.deliver;
var errorStatus = messages.errorStatus;
var jobs = {};
var TOKEN_EXPIRY_MARGIN_SECONDS = C.TOKEN_EXPIRY_MARGIN_SECONDS;

/** Refresh the selected account; all asynchronous work stays bound to its ID and revision.
 * Rotated credentials are saved even if selection changes. Removed/reconnected
 * accounts reject late responses. Repeated requests reuse the account's active job.
 */
function refresh() {
  var account = accounts.current();

  if (!account.config) {
    status(C.OPEN_APP_SETTINGS);

    return;
  }

  if (account.snapshot) {
    deliver(account.snapshot, true);
  } else {
    status(C.UPDATING_STATUS);
  }

  if (jobs[account.id] && jobs[account.id].revision === account.revision) {
    return;
  }

  var job = {
    id: account.id,
    provider: account.provider,
    config: account.config,
    revision: account.revision,
    renewed: false
  };

  jobs[job.id] = job;

  function valid() {
    var latest = accounts.get(job.id);

    return latest && latest.revision === job.revision;
  }

  function finish() {
    if (jobs[job.id] === job) {
      delete jobs[job.id];
    }
  }

  function fail(error, auth) {
    finish();

    if (valid()) {
      statusFor(job.id, errorStatus(error, job.provider, auth));
    }
  }

  function renew() {
    job.renewed = true;
    providers.renew(job.provider, job.config, function (error, next) {
      if (error) {
        fail(error, true);

        return;
      }

      // Compare revisions so a removed/reconnected account cannot be resurrected by a late refresh.
      var saved = accounts.save(job.id, next, job.revision);

      if (!saved) {
        finish();

        return;
      }

      job.config = next;
      job.revision = saved.revision;
      usage();
    });
  }

  function usage() {
    providers.usage(job.provider, job.config, function (error, data) {
      if (!valid()) {
        finish();

        return;
      }

      if (error && error.status === C.HTTP_UNAUTHORIZED && !job.renewed) {
        renew();

        return;
      }

      if (error) {
        fail(error, false);

        return;
      }

      if (data.plan) {
        job.config.plan = data.plan;
      }

      // Project discovery and plan metadata do not change the local profile identity.
      var saved = accounts.save(job.id, job.config, job.revision);

      if (!saved) {
        finish();

        return;
      }

      job.revision = saved.revision;
      accounts.cache(job.id, data, job.revision);
      finish();

      if (accounts.current().id === job.id) {
        deliver(data);
      }
    });
  }

  if (
    job.config.expiresAt &&
    job.config.expiresAt <= Date.now() / C.MILLISECONDS_PER_SECOND + TOKEN_EXPIRY_MARGIN_SECONDS
  ) {
    renew();
  } else {
    usage();
  }
}

module.exports = refresh;
