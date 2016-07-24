// Delete subscription
var joi = require('joi');
var config = require('../config');
var db = require('../db');
var utils = require('../utils');

module.exports.handler = function(request, reply) {
  var ObjectID = db.Mongoose.Types.ObjectId;
  var id = request.params.id;
  var _id;
  try {
    _id = new ObjectID(id);
  } catch(e) {
    return reply(utils.formatError('Not Found')).code(404);
  }
  
  var auth = request.headers.authorization;
  if (!auth) {
    return reply().code(401);
  }
  if (auth.indexOf(config.get('authHeader')) !== 0) {
    return reply().code(401);
  }
  auth = auth.replace(config.get('authHeader'), '');
  var authArr = auth.split(',');
  var authObj = {};
  authArr.forEach(function(item) {
    var sep = item.indexOf('=');
    var p = item.substring(0, sep).trim();
    var v = item.substring(sep + 1).trim();
    authObj[p] = v;
  });

  var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
  var userAgent = request.headers['user-agent'];
  var query = {
    '_id' : _id,
    'endpoint': authObj.endpoint,
    'keys.p256dh': authObj.p256dh,
    'keys.auth': authObj.auth
  };
  var update = {
    status: false,
    unsubscribed: {
      date: new Date(),
      ip: ip,
      userAgent: userAgent
    }
  };
  var options = {
    upsert: false,
    multi: false
  };
  
  db.collection.update(query, update, options)
  .then(function(doc) {
    if (doc.result.ok === 1 && doc.result.n === 1) {
      return reply({ status: 1});
    }
    return reply(utils.formatError('Not Found')).code(404);
  })
  .catch(function(err) {
    return reply(utils.formatError('Internal MongoDB error', err)).code(500);
  });
};

module.exports.validate = {
  params: {
    id: joi.string().required() // TODO check length and/or regex
  }
};