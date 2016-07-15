/* global before, afterEach */
var Mongoose = require('mongoose');
var MMongoose = Mongoose.Mongoose;
var mongoose = new MMongoose();
// var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var config = require('../config');
var server;

module.exports.config = config;

module.exports.goodClient = [
  {
    'endpoint' : 'https://android.googleapis.com/gcm/send/dcqAlHtjC84:APA91bHj7Qp1d-ZPy83313ohQaE_CSeSvczh-3Qfj1dyzkAV_K3FTSfqXH2LmS_AF9uv1TmcAneMH2MHSeqRHxo9QfoblfYODySeV_2L1kV0pEhEBbBHhXokOzVAZyvGGpT0K07rAPqc',
    'keys' : {
      'p256dh' : 'BOAIOs5VFlB7pOVaYeAhU_ZIKtQg5NIKQ7au039IuKHdOslq8At8aXTA6ei3vEVSwh3dGKlCoIeqS-EcNidCTRg=',
      'auth' : '5z1_fh3BTWc7txBFut3KdQ=='
    }
  },
  {
    'endpoint' : 'https://android.googleapis.com/gcm/send/dcqAlHtjC84:APA91bHj7Qp1d-ZPy83313ohQaE_CSeSvczh-3Qfj1dyzkAV_K3FTSfqXH2LmS_AF9uv1TmcAneMH2MHSeqRHxo9QfoblfYODySeV_2L1kV0pEhEBbBHhXokOzVAZyvGGpT0K07rAPqc',
    'keys' : {
      'p256dh' : 'BOAIOs5VFlB7pOVaYeAhU_ZIKtQg5NIKQ7au039IuKHdOslq8At8aXTA6ei3vEVSwh3dGKlCoIeqS-EcNidCTRg=',
      'auth' : '5z1_fh3BTWc7txBFut3KdQ=='
    }
  }
];
module.exports.badClients = [];


var dbCollection = Mongoose.connection.collection(config.collectionName);
module.exports.dbCollection = dbCollection;

before(function(done) {
  mockgoose(mongoose)
  .then(function() {
    mongoose.connect('mongodb://localhost:27017/clients', function(err) {
      server = require('../server');
      done(err);
    });
  })
  .catch(done);
});

afterEach(function(done) {
  if (mongoose.isMocked === true) {
    mockgoose.reset(function() {
      dbCollection.remove()
      .then(function() {
        done();
      })
      .catch(done);
    });
  }
  else {
    done();
  }
});