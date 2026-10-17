var C = require('../resources/accounts/order');
var store = require('./store');
var get = require('./queries').get;

var load = store.load;
var write = store.write;

function select(id) {
  var state = load();

  if (
    !state.accounts.some(function (a) {
      return a.id === id;
    })
  ) {
    throw new Error(C.ERROR_ACCOUNT_NOT_FOUND);
  }

  state.selectedId = id;
  write(state);

  return get(id);
}

function reorder(ids) {
  var state = load();

  if (
    !Array.isArray(ids) ||
    ids.length !== state.accounts.length ||
    ids.some(function (id, i) {
      return (
        typeof id !== 'string' ||
        ids.indexOf(id) !== i ||
        !state.accounts.some(function (a) {
          return a.id === id;
        })
      );
    })
  ) {
    throw new Error(C.ERROR_INVALID_ACCOUNT_ORDER);
  }

  state.accounts = ids.map(function (id) {
    return state.accounts.filter(function (a) {
      return a.id === id;
    })[0];
  });
  write(state);
}

module.exports = { select: select, reorder: reorder };
