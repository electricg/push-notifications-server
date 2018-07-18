// Get all subscriptions
var config = require('../config');
var utils = require('../utils');
var collection = require('../collections/clients');

module.exports.handler = function(request, reply) {
  if (config.get('publicList')) {
    collection
      .list()
      .then(function(doc) {
        reply(doc);
      })
      .catch(function(err) {
        return reply(utils.formatError('Internal MongoDB error', err)).code(
          500
        );
      });
  } else {
    return reply().code(401);
  }
};
