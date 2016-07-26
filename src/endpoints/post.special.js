// Send message to all subscriptions
var joi = require('joi');
var config = require('../config');
var utils = require('../utils');
var webpush = require('../webpush');
var collectionClients = require('../collections/clients');
var collectionMessages = require('../collections/messages');

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
  collectionClients.list(query, projection)
  .then(function(doc) {
    if (doc.length) {
      return webpush.sendPushes(doc, msg, title)
      .then(function(res) {
        return { status: 1, failed: res.e, succeeded: res.r };
      })
      .catch(function(err) {
        // not returning an HTTP error status code because it could be a mixture of good and bad pushes 
        return { status: 0, failed: err.e, succeeded: err.r };
      });
    }
    else {
      return { status: 0, message: 'No keys registered' };
    }
  })
  .then(function(res) {
    var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
    var userAgent = request.headers['user-agent'];
    var insert = {
      msg: msg,
      title: title,
      ip: ip,
      userAgent: userAgent,
      result: res
    };
    return collectionMessages.add(insert)
    .catch(function(err) {
      res.err = utils.formatError('Internal MongoDB error', err);
    })
    .then(function() {
      return reply(res);
    });
  })
  .catch(function(err) {
    return reply(utils.formatError('Internal MongoDB error', err)).code(500);
  });
};

module.exports.validate = {
  payload: {
    key: joi.string().strict().required(),
    msg: joi.string().strict().required(),
    title: joi.string().strict().optional().default('')
  }
};