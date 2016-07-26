// Add subscription
var joi = require('joi');
var utils = require('../utils');
var webpush = require('../webpush');
var collection = require('../collections/clients');

module.exports.handler = function(request, reply) {
  var endpoint = request.payload.endpoint;
  var keys = request.payload.keys;
  var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
  var userAgent = request.headers['user-agent'];
  var data = {
    endpoint: endpoint,
    keys: keys,
    ip: ip,
    userAgent: userAgent
  };
  // before saving into the db, send one notification to check the endpoint exists or the keys are ok
  webpush.checkSubscribtion({ endpoint: endpoint, keys: keys })
  .then(function() {
    collection.add(data)
    .then(function(doc) {
      var _id = doc._id;
      return reply({ status: 1, id: _id });
    })
    .catch(function(err) {
      if (err === 500) {
        return reply(utils.formatError('Error inserting the data')).code(500);
      }
      if (err === 401) {
        return reply().code(401);
      }
      return reply(utils.formatError('Internal MongoDB error', err)).code(500);
    });
  })
  .catch(function(err) {
    return reply(utils.formatError('Error registering subscription to GCM', err)).code(400);
  });
};

module.exports.validate = {
  payload: {
    endpoint: joi.string().strict().uri({ scheme: 'https' }).required(), // TODO check length and/or regex
    keys: {
      auth: joi.string().strict().regex(/^[a-zA-Z0-9_=-]+$/).required(),
      p256dh: joi.string().strict().regex(/^[a-zA-Z0-9_=-]+$/).required()
    }
  }
};