var C = require('../../resources/providers/codex/transport');
var http = require('../../network/http').request;

var AUTH = C.AUTH_ORIGIN;

/**
 * Send JSON to a path under the fixed Codex authentication origin.
 * @param {string} path Authentication path beginning with a slash.
 * @param {*} data JSON-serializable request payload.
 * @param {Function} done Error-first callback receiving (error, parsedResponse).
 * @param {string} [group] Cancellation group; omitted values use the usage group.
 * @returns {void} Completion/cancellation follows the shared HTTP transport contract.
 * @throws {TypeError} If the request payload cannot be serialized.
 */
function jsonPost(path, data, done, group) {
  http(
    C.HTTP_POST,
    AUTH + path,
    JSON.stringify(data),
    { 'Content-Type': C.CONTENT_TYPE_JSON },
    done,
    group
  );
}

module.exports = jsonPost;
