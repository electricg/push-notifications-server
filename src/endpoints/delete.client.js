// Delete subscription
var joi = require('joi');
var config = require('../config');
var utils = require('../utils');
var collection = require('../collections/clients');

module.exports.handler = function(request, reply) {
  var id = request.params.id;
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
    '_id' : id,
    'endpoint': authObj.endpoint,
    'p256dh': authObj.p256dh,
    'auth': authObj.auth
  };
  var update = {
    ip: ip,
    userAgent: userAgent
  };
  
  collection.remove(query, update)
  .then(function() {
    return reply({ status: 1});
  })
  .catch(function(err) {
    if (err === 404) {
      return reply(utils.formatError('Not Found')).code(404);
    }
    return reply(utils.formatError('Internal MongoDB error', err)).code(500);
  });
};

module.exports.validate = {
  params: {
    id: joi.string().lowercase().length(24).hex().required()
  }
};