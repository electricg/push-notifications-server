// Send message to all subscriptions
var joi = require('joi');
var config = require('../config');
var utils = require('../utils');
var webpush = require('../webpush');
var collection = require('../collections/clients');

module.exports.handler = function(request, reply) {
  var key = request.payload.key;
  if (key !== config.get('privateAuth')) {
    return reply().code(401);
  }

  var msg = request.payload.msg;
  var title = request.payload.title;
  var query = { status: true };
  var projection = {
    _id: false,
    endpoint: true,
    keys: true
  };
  collection.list(query, projection)
  .then(function(doc) {
    if (doc.length) {
      return webpush.sendPushes(doc, msg, title)
      .then(function(res) {
        return reply({ status: 1, failed: res.e, succeeded: res.r });
      })
      .catch(function(err) {
        // not returning an HTTP error status code because it could be a mixture of good and bad pushes 
        return reply({ status: 0, failed: err.e, succeeded: err.r });
      });
    }
    else {
      return reply({ status: 0, message: 'No keys registered' });
    }
  })
  .catch(function(err) {
    return reply(utils.formatError('Internal MongoDB error', err)).code(500);
  });
};

module.exports.validate = {
  payload: {
    key: joi.string().required(),
    msg: joi.string().required(),
    title: joi.string()
  }
};