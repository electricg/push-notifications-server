/* global before, afterEach */
var Mongoose = require('mongoose');
var MMongoose = Mongoose.Mongoose;
var mongoose = new MMongoose();
var mockgoose = require('mockgoose');
var nock = require('nock');
var bluebird = require('bluebird');
var config = require('../src/config');
var db = require('../src/db');
var server;

module.exports.config = config;
module.exports.db = db;

module.exports.baseUrl = 'http://' + config.get('host') + ':' + config.get('port');

module.exports.goodClients = [
  {
    'endpoint' : 'https://android.googleapis.com/gcm/send/dcqAlHtjC84:APA91bHj7Qp1d-ZPy83313ohQaE_CSeSvczh-3Qfj1dyzkAV_K3FTSfqXH2LmS_AF9uv1TmcAneMH2MHSeqRHxo9QfoblfYODySeV_2L1kV0pEhEBbBHhXokOzVAZyvGGpT0K07rAPqc',
    'keys' : {
      'p256dh' : 'BOAIOs5VFlB7pOVaYeAhU_ZIKtQg5NIKQ7au039IuKHdOslq8At8aXTA6ei3vEVSwh3dGKlCoIeqS-EcNidCTRg=',
      'auth' : '5z1_fh3BTWc7txBFut3KdQ=='
    }
  }
];
module.exports.badClients = [
  {
    'endpoint' : 'https://android.googleapis.com/gcm/send/dcqAlHtjC84:APA91bHj7Qp1d-ZPy83313ohQaE_CSeSvczh-3Qfj1dyzkAV_K3FTSfqXH2LmS_AF9uv1TmcAneMH2MHSeqRHxo9QfoblfYODySeV_2L1kV0pEhEBbBHhXokOzVAZyvGGpT0K07rAPqx',
    'keys' : {
      'p256dh' : 'BOAIOs5VFlB7pOVaYeAhU_ZIKtQg5NIKQ7au039IuKHdOslq8At8aXTA6ei3vEVSwh3dGKlCoIeqS-EcNidCTRgx',
      'auth' : '5z1_fh3BTWc7txBFut3KdQ=x'
    }
  }
];
module.exports.gcmUrl = /(gcm-http.googleapis\.com)|(android\.googleapis\.com)/;


before(function(done) {
  mockgoose(mongoose)
  .then(function() {
    mongoose.connect(config.get('mongodbUrl'), {
      promiseLibrary: bluebird
    }, function(err) {
      server = require('../index');
      done(err);
    });
  })
  .catch(done);
});

afterEach(function(done) {
  nock.cleanAll();
  if (mongoose.isMocked === true) {
    mockgoose.reset(function() {
      db.collection.remove()
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