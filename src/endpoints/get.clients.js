// Get all subscriptions
var config = require('../config');
var db = require('../db');
var utils = require('../utils');

module.exports.handler = function(request, reply) {
  if (config.get('publicList')) {
    db.collection.find().toArray()
    .then(function(doc) {
      reply(doc);
    })
    .catch(function(err) {  
      return reply(utils.formatError('Internal MongoDB error', err)).code(500);
    });
  }
  else {
    return reply().code(401);
  }
};