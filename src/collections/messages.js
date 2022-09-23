var config = require('../config');
var db = require('@electricg/hapi-mongodb-server/src/db');
var collection = db.db.collection(config.get('collectionMessages'));

module.exports.add = function(insert) {
  return new Promise(function(resolve, reject) {
    var _insert = {
      msg: insert.msg,
      title: insert.title,
      date: new Date(),
      ip: insert.ip,
      userAgent: insert.userAgent,
      result: insert.result,
    };
    var _options = {
      w: 1,
    };

    collection
      .insert(_insert, _options)
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
