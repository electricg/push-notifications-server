var Hapi = require('hapi');
var joi = require('joi');
var mongodb = require('hapi-mongodb');
var Promise = require('bluebird');
var webpush = require('web-push-encryption');

var privateAuth = 'xxx'; // secret word to allow push endpoint
var collectionName = 'clients';
var port = 8082;
var host = '127.0.0.1';
var mongodbUrl = 'mongodb://localhost:27017/clients';

var gcmAuth = 'xxx'; // GCM API key

var sendPush = function(subscriptions, msg) {
  webpush.setGCMAPIKey(gcmAuth);
  return Promise.map(subscriptions, function(subscription) {
    webpush.sendWebPush(msg, subscription);
  })
  .then(function(res) {
    return res;
  })
  .catch(function(err) {
    return err;
  });
};

var server = new Hapi.Server();

server.connection({
  port: port,
  host: host
});

server.register({
  register: mongodb,
  options: {
    url : mongodbUrl,
    settings : {
      db : {
        'native_parser' : false
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
    db.collection(collectionName).insert(data, opt, function(err, doc) {
      if (err) {
        return reply(Hapi.error.internal('Internal MongoDB error', err));
      }
      // return reply(doc);
      if (doc.result.ok === 1 && doc.result.n === 1) {
        var _id = doc.ops[0]._id;
        return reply({ status: 1, id: _id });
      }
      return reply(Hapi.error.internal('Error inserting the data'));
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

server.route({
  method: 'DELETE',
  path: '/client/{id}',
  handler: function(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    var id = request.params.id;
    db.collection(collectionName).remove({ '_id' : new ObjectID(id) }, function(err, doc) {
      if (err) {
        return reply(Hapi.error.internal('Internal MongoDB error', err));
      }
      if (doc.result.ok === 1) {
        return reply({ status: 1});
      }
      return reply(Hapi.error.internal('Error deleting the data'));
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
    db.collection(collectionName).find(query, projection).toArray(function(err, doc) {
      if (err) {
        return reply(Hapi.error.internal('Internal MongoDB error', err));
      }
      if (doc.length) {
        return sendPush(doc, msg)
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