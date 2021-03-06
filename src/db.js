var Mongoose = require('mongoose');
var bluebird = require('bluebird');
var config = require('./config');

var connect = function(cb) {
  Mongoose.connect(
    config.get('mongodbUrl'),
    {
      promiseLibrary: bluebird,
      server: {
        auto_reconnect: true,
        socketOptions: {
          connectTimeoutMS: 3600000,
          keepAlive: 3600000,
          socketTimeoutMS: 3600000,
        },
      },
    },
    function(err) {
      if (err) {
        console.log('Error', err);
      }
      cb();
    }
  );
};
module.exports.connect = connect;
var db = Mongoose.connection;

module.exports.db = db;
module.exports.ObjectId = Mongoose.Types.ObjectId;

module.exports.reconnect = function(cb) {
  if (db.readyState === 0) {
    connect(cb);
    db = Mongoose.connection;
  }
};

db.on('connected', function() {
  console.log('Connection established to MongoDB');
});
db.on('error', function(err) {
  console.log('Error', `${err.name}: ${err.message}`);
});
db.on('disconnected', function() {
  console.log('Error', 'Lost MongoDB connection');
});
db.on('reconnected', function() {
  console.log('Reconnected to MongoDB');
});
