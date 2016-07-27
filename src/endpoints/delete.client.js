// Delete subscription
var utils = require('../utils');
var validation = require('../validation');
var collection = require('../collections/clients');

module.exports.handler = function(request, reply) {
  var id = request.params.id;
  var authObj = request.headers.authorization;
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
    id: validation.clientId
  },
  headers: validation.headers
};