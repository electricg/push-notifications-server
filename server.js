var Hapi = require('hapi');
var joi = require('joi');
var Mongoose = require('mongoose');
var Promise = require('bluebird');
var webpush = require('web-push-encryption');
var config = require('./config');


//=== DB
var connect = function() {
  Mongoose.connect(config.mongodbUrl, {
    promiseLibrary: Promise,
    server: {
      'auto_reconnect': true,
      socketOptions: {
        connectTimeoutMS: 3600000,
        keepAlive: 3600000,
        socketTimeoutMS: 3600000
      }
    }
  }, function(err) {
    if (err) {
      console.log('error', err);
    }
  });
};
connect();
var db = Mongoose.connection;
var collection = db.collection(config.collectionName);
var reconnect = function() {
  if (db.readyState === 0) {
    connect();
    db = Mongoose.connection;
  }
};
db.db.on('connected', function() {
  console.log('Connection established to MongoDB');
});
db.db.on('error', function(err) {
  console.log('error', err.name + ': ' + err.message);
});
db.db.on('disconnected', function() {
  console.log('error', 'Lost MongoDB connection');
});
db.db.on('reconnected', function() {
  console.log('Reconnected to MongoDB');
});


//=== Web Push
webpush.setGCMAPIKey(config.gcmAuth);

// Send push with message to a single subscription
// try and catch is for when subscription is invalid
// (the webpush library throws errors in that case)
var sendPush = function(subscription, msg) {
  try {
    return webpush.sendWebPush(msg, subscription);
  } catch(e) {
    return Promise.reject(e);
  }
};

// Send push with welcome message when subscribtion data arrives
var checkSubscribtion = function(subscription) {
  return sendPush(subscription, config.welcomeMsg);
};

// Send push with message to all the subscriptions
// the calls are indipendent from each other, we just want to know if all succeed or it at least one fails
var sendPushes = function(subscriptions, msg) {
  return Promise.map(subscriptions, function(subscription) {
    sendPush(subscription, msg);
  })
  .then(function(res) {
    return res;
  })
  .catch(function(err) {
    return err;
  });
};


var formatError = function(msg, err) {
  var obj = {
    status: 0,
    error: msg
  };

  if (err) {
    obj.details = err.message || (err.statusCode + ' ' + err.statusMessage);
  }

  return obj;
};


//=== Server
var server = new Hapi.Server();

server.connection({
  port: config.port,
  host: config.host,
  routes: { cors: { origin: [config.allowedOrigins] } }
});

server.start(function(err) {
  if (err) {
    console.error(err);
    throw err;
  }
  console.log('Server started at: ', server.info.uri);
});

var pre = function(request, reply) {
  reconnect();
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
    collection.find().toArray()
    .then(function(doc) {
      reply(doc);
    })
    .catch(function(err) {  
      return reply(formatError('Internal MongoDB error', err)).code(500);
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
    checkSubscribtion({ endpoint: endpoint, keys: keys })
    .then(function() {
      collection.insert(data, opt)
      .then(function(doc) {
        // console.log(doc);
        if (doc.result.ok === 1 && doc.result.n === 1) {
          var _id = doc.ops[0]._id;
          return reply({ status: 1, id: _id });
        }
        return reply(formatError('Error inserting the data')).code(500);
      })
      .catch(function(err) {
        return reply(formatError('Internal MongoDB error', err)).code(500);
      });
    })
    .catch(function(err) {
      return reply(formatError('Error registering subscription to GCM', err)).code(400);
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
    var ObjectID = Mongoose.Types.ObjectId;
    var id = request.params.id;
    var _id;
    try {
      _id = new ObjectID(id);
    } catch(e) {
      return reply(formatError('Not Found')).code(404);
    }
    collection.remove({ '_id' : _id })
    .then(function(doc) {
      if (doc.result.ok === 1) {
        return reply({ status: 1});
      }
      return reply(formatError('Error deleting the data')).code(500);
    })
    .catch(function(err) {
      return reply(formatError('Internal MongoDB error', err)).code(500);
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
    collection.find(query, projection).toArray(function(err, doc) {
      if (err) {
        return reply(formatError('Internal MongoDB error', err)).code(500);
      }
      if (doc.length) {
        return sendPushes(doc, msg)
        .then(function() {
          return reply({ status: 1 });
        })
        .catch(function(err) {
          // not returning an HTTP error status code because it could be a mixture of good and bad pushes 
          return reply({ status: 0, error: err });
        });
      }
      else {
        return reply({ status: 0, message: 'No keys registered' });
      }
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