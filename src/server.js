var Hapi = require('hapi');
var joi = require('joi');
var Promise = require('bluebird');
var config = require('./config');
var db = require('./db');
var utils = require('./utils');
var webpush = require('./webpush');


//=== Server
var server = new Hapi.Server();

server.connection({
  port: config.port,
  host: config.host,
  routes: { cors: { origin: config.allowedOrigins } }
});

var pre = function(request, reply) {
  db.reconnect();
  return reply();
};

// Static endpoint for checking server status and debugging
server.route({
  method: 'GET',
  path: '/info',
  handler: function(request, reply) {
    console.log('info');
    reply({ status: 1, version: '1.0.0' });
  }
});

// Get all subscriptions
// I personally don't want it enabled
server.route({
  method: 'GET',
  path: '/clients',
  handler: function(request, reply) {
    db.collection.find().toArray()
    .then(function(doc) {
      reply(doc);
    })
    .catch(function(err) {  
      return reply(utils.formatError('Internal MongoDB error', err)).code(500);
    });
  },
  config: {
    pre: [{ method: pre }]
  }
});

// Add subscription
server.route({
  method: 'POST',
  path: '/clients',
  handler: function(request, reply) {
    var endpoint = request.payload.endpoint;
    var keys = request.payload.keys;
    // var ip = request.info.remoteAddress + ':' + request.info.remotePort;
    var data = {
      endpoint: endpoint,
      keys: keys,
      // ip: ip,
      date: new Date()
    };
    var opt = { w: 1 };
    // before saving into the db, send one notification to check the endpoint exists or the keys are ok
    webpush.checkSubscribtion({ endpoint: endpoint, keys: keys })
    .then(function() {
      db.collection.insert(data, opt)
      .then(function(doc) {
        // console.log(doc);
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
  },
  config: {
    pre: [{ method: pre }],
    validate: {
      payload: {
        endpoint: joi.string().required(), // TODO check length and/or regex
        keys: {
          auth: joi.string().required(), // TODO check length and/or regex
          p256dh: joi.string().required() // TODO check length and/or regex
        }
      }
    }
  }
});

// Delete subscription
server.route({
  method: 'DELETE',
  path: '/client/{id}',
  handler: function(request, reply) {
    var ObjectID = db.Mongoose.Types.ObjectId;
    var id = request.params.id;
    var _id;
    try {
      _id = new ObjectID(id);
    } catch(e) {
      return reply(utils.formatError('Not Found')).code(404);
    }
    db.collection.remove({ '_id' : _id })
    .then(function(doc) {
      if (doc.result.ok === 1) {
        return reply({ status: 1});
      }
      return reply(utils.formatError('Error deleting the data')).code(500);
    })
    .catch(function(err) {
      return reply(utils.formatError('Internal MongoDB error', err)).code(500);
    });
  },
  config: {
    pre: [{ method: pre }],
    validate: {
      params: {
        id: joi.string().required() // TODO check length and/or regex
      }
    }
  }
});

// Send message to all subscriptions
server.route({
  method: 'POST',
  path: '/' + config.privatePath,
  handler: function(request, reply) {
    var key = request.payload.key;
    if (key !== config.privateAuth) {
      return reply().code(401);
    }

    var msg = request.payload.msg;
    var query = {};
    var projection = {
      _id: false,
      endpoint: true,
      keys: true
    };
    db.collection.find(query, projection).toArray()
    .then(function(doc) {
      if (doc.length) {
        return webpush.sendPushes(doc, msg)
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
  },
  config: {
    pre: [{ method: pre }],
    validate: {
      payload: {
        key: joi.string().required(),
        msg: joi.string().required()
      }
    }
  }
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