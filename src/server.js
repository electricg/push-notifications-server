var Hapi = require('hapi');
var config = require('./config');
var db = require('./db');

var server = new Hapi.Server();

server.connection({
  port: config.get('port'),
  host: config.get('host'),
  routes: { cors: { origin: config.get('allowedOrigins') } },
});

var routes = [
  { method: 'GET', path: '/info', module: 'get.info' },
  { method: 'GET', path: '/clients', module: 'get.clients' },
  { method: 'POST', path: '/clients', module: 'post.clients' },
  { method: 'DELETE', path: '/client/{id}', module: 'delete.client' },
  {
    method: 'GET',
    path: `/${config.get('privatePath')}`,
    module: 'get.special',
  },
  {
    method: 'POST',
    path: `/${config.get('privatePath')}`,
    module: 'post.special',
  },
];

routes.forEach(function(route) {
  var mod = require(`./endpoints/${route.module}`);
  var options = {
    method: route.method,
    path: route.path,
    handler: mod.handler,
    config: {
      pre: [
        {
          method: function(request, reply) {
            db.reconnect();
            return reply();
          },
        },
      ],
    },
  };
  if (mod.validate) {
    options.config.validate = mod.validate;
  }
  server.route(options);
});

module.exports.start = function() {
  return new Promise(function(resolve, reject) {
    server.start(function(err) {
      if (err) {
        console.log('Server error', err);
        return reject(err);
      }
      console.log('Server started at: ', server.info.uri);
      return resolve();
    });
  });
};
