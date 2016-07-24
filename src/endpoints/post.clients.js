// Add subscription
var joi = require('joi');
var db = require('../db');
var utils = require('../utils');
var webpush = require('../webpush');

module.exports.handler = function(request, reply) {
  var endpoint = request.payload.endpoint;
  var keys = request.payload.keys;
  var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
  var userAgent = request.headers['user-agent'];
  var data = {
    endpoint: endpoint,
    keys: keys,
    subscribed: {
      date: new Date(),
      ip: ip,
      userAgent: userAgent
    },
    status: true
  };
  var opt = { w: 1 };
  // before saving into the db, send one notification to check the endpoint exists or the keys are ok
  webpush.checkSubscribtion({ endpoint: endpoint, keys: keys })
  .then(function() {
    db.collection.insert(data, opt)
    .then(function(doc) {
      if (doc.result.ok === 1 && doc.result.n === 1) {
        var _id = doc.ops[0]._id;
        return reply({ status: 1, id: _id });
      }
      return reply(utils.formatError('Error inserting the data')).code(500);
    })
    .catch(function(err) {
      return reply(utils.formatError('Internal MongoDB error', err)).code(500);
    });
  })
  .catch(function(err) {
    return reply(utils.formatError('Error registering subscription to GCM', err)).code(400);
  });
};

module.exports.validate = {
  payload: {
    endpoint: joi.string().required(), // TODO check length and/or regex
    keys: {
      auth: joi.string().required(), // TODO check length and/or regex
      p256dh: joi.string().required() // TODO check length and/or regex
    }
  }
};