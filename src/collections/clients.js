var config = require('../config');
var db = require('../db');
var collection = db.db.collection(config.get('collectionClients'));

module.exports.remove = function(query, update) {
  return new Promise(function(resolve, reject) {
    var _query = {
      _id: db.ObjectId(query._id),
      endpoint: query.endpoint,
      'keys.p256dh': query.p256dh,
      'keys.auth': query.auth,
    };
    var _update = {
      $set: {
        status: false,
        unsubscribed: {
          date: new Date(),
          ip: update.ip,
          userAgent: update.userAgent,
        },
      },
    };
    var _options = {
      upsert: false,
      multi: false,
    };

    collection
      .update(_query, _update, _options)
      .then(function(res) {
        if (res.result.ok === 1 && res.result.n === 1) {
          return resolve();
        }
        return reject(404);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

module.exports.removeInvalid = function(arr) {
  const promises = arr.map(function(query) {
    var _update = {
      $set: {
        status: false,
        unsubscribed: {
          date: new Date(),
          ip: '',
          userAgent: '',
        },
      },
    };
    var _options = {
      upsert: false,
      multi: false,
    };
    return collection.update(query, _update, _options);
  });

  return Promise.all(promises);
};

module.exports.list = function(query, projection) {
  return new Promise(function(resolve, reject) {
    var _query = query || {};
    var _projection = projection || {};
    collection
      .find(_query, _projection)
      .toArray()
      .then(function(res) {
        resolve(res);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

module.exports.add = function(insert) {
  return new Promise(function(resolve, reject) {
    var _insert = {
      endpoint: insert.endpoint,
      keys: insert.keys,
      subscribed: {
        date: new Date(),
        ip: insert.ip,
        userAgent: insert.userAgent,
      },
      status: true,
    };
    var _options = {
      w: 1,
    };

    // check uniqueness of client, status doesn't matter
    collection
      .findOne({
        endpoint: insert.endpoint,
        keys: insert.keys,
      })
      .then(function(res) {
        if (res) {
          return reject(401);
        }
      })
      .then(function() {
        return collection.insert(_insert, _options);
      })
      .then(function(res) {
        if (res.result.ok === 1 && res.result.n === 1) {
          return resolve(res.ops[0]);
        }
        return reject(500);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};
