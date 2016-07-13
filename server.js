var Hapi = require('hapi');
var joi = require('joi');
var Promise = require('bluebird');
var webpush = require('web-push-encryption');

var collectionName = 'clients';
var welcomeMsg = 'You have successfully subscribed to ELECTRIC_G notifications!';

var port = ~~process.env.PORT || 8082;
var host = process.env.HOST || '127.0.0.1';
var mongodbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/clients';
var allowedOrigins = process.env.CLIENT || 'http://localhost:8085';
var privateAuth = process.env.PRIVATE_AUTH || 'xxx'; // secret word to allow push endpoint
var gcmAuth = process.env.GCM_AUTH || 'xxx'; // GCM API key

webpush.setGCMAPIKey(gcmAuth);

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
  return sendPush(subscription, welcomeMsg);
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
    obj.details = err.message;
  }

  return obj;
};

var server = new Hapi.Server();

server.connection({
  port: port,
  host: host,
  routes: { cors: { origin: [allowedOrigins] } }
});

server.register({
  register: require('hapi-mongodb'),
  options: {
    url : mongodbUrl,
    settings : {
      db : {
        'native_parser' : false
      },
      server: {
        'auto_reconnect': true
      }
    }
  }
}, function(err) {
  if (err) {
    console.error(err);
    throw err;
  }
  server.start(function(err) {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log('Server started at: ', server.info.uri);
  });
});

// Test
server.route({
  method: 'GET',
  path: '/giulia',
  handler: function(request, reply) {
    console.log('giulia');
    reply({ status: 1, text: 'ciao' });
  }
});

// Get all subscriptions
server.route({
  method: 'GET',
  path: '/clients',
  handler: function(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    db.collection(collectionName).find().toArray(function(err, doc) {
      if (err) {
        return reply(formatError('Internal MongoDB error', err)).code(500);
      }
      reply(doc);
    });
  }
});

// Add subscription
server.route({
  method: 'POST',
  path: '/clients',
  handler: function(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var endpoint = request.payload.endpoint;
    var keys = request.payload.keys;
    var ip = request.info.remoteAddress + ':' + request.info.remotePort;
    var data = {
      endpoint: endpoint,
      keys: keys,
      ip: ip,
      date: new Date()
    };
    var opt = { w: 1 };
    // before saving into the db, send one notification to check the endpoint exists or the keys are ok
    checkSubscribtion({ endpoint: endpoint, keys: keys })
    .then(function() {
      db.collection(collectionName).insert(data, opt, function(err, doc) {
        if (err) {
          return reply(formatError('Internal MongoDB error', err)).code(500);
        }
        // return reply(doc);
        if (doc.result.ok === 1 && doc.result.n === 1) {
          var _id = doc.ops[0]._id;
          return reply({ status: 1, id: _id });
        }
        return reply(formatError('Error inserting the data')).code(500);
      });
    })
    .catch(function(err) {
      return reply(formatError('Error registering subscription to GCM', err)).code(400);
    });
  },
  config: {
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
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    var id = request.params.id;
    db.collection(collectionName).remove({ '_id' : new ObjectID(id) }, function(err, doc) {
      if (err) {
        return reply(formatError('Internal MongoDB error', err)).code(500);
      }
      if (doc.result.ok === 1) {
        return reply({ status: 1});
      }
      return reply(formatError('Error deleting the data')).code(500);
    });
  },
  config: {
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
  path: '/special',
  handler: function(request, reply) {
    var key = request.payload.key;
    if (key !== privateAuth) {
      return reply().code(401);
    }

    var db = request.server.plugins['hapi-mongodb'].db;
    var msg = request.payload.msg;
    var query = {};
    var projection = {
      _id: false,
      endpoint: true,
      keys: true
    };
    console.log('special 1');
    db.collection(collectionName).find(query, projection).toArray(function(err, doc) {
      console.log('special 2');
      if (err) {
        return reply(formatError('Internal MongoDB error', err)).code(500);
      }
      if (doc.length) {
        return sendPushes(doc, msg)
        .then(function() {
          return reply({ status: 1 });
        })
        .catch(function(err) {
          return reply({ status: 0, error: err });
        });
      }
      else {
        return reply({ status: 0, message: 'No keys registered' });
      }
    });
  },
  config: {
    validate: {
      payload: {
        key: joi.string().required(),
        msg: joi.string().required()
      }
    }
  }
});