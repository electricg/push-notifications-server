/* global before, afterEach */
var Mongoose = require('mongoose');
var MMongoose = Mongoose.Mongoose;
var mongoose = new MMongoose();
var mockgoose = require('mockgoose');
var nock = require('nock');
var bluebird = require('bluebird');
var Promise = bluebird;
var _ = require('lodash');
var config = require('../src/config');
var db = require('../src/db');
var server;

module.exports.config = config;
module.exports.db = db;
module.exports.collectionClients = db.db.collection(
  config.get('collectionClients')
);
module.exports.collectionMessages = db.db.collection(
  config.get('collectionMessages')
);

module.exports.baseUrl = `http://${config.get('host')}:${config.get('port')}`;

var goodClients = [
  {
    endpoint:
      'https://android.googleapis.com/gcm/send/dcqAlHtjC84:APA91bHj7Qp1d-ZPy83313ohQaE_CSeSvczh-3Qfj1dyzkAV_K3FTSfqXH2LmS_AF9uv1TmcAneMH2MHSeqRHxo9QfoblfYODySeV_2L1kV0pEhEBbBHhXokOzVAZyvGGpT0K07rAPqc',
    keys: {
      p256dh:
        'BOAIOs5VFlB7pOVaYeAhU_ZIKtQg5NIKQ7au039IuKHdOslq8At8aXTA6ei3vEVSwh3dGKlCoIeqS-EcNidCTRg=',
      auth: '5z1_fh3BTWc7txBFut3KdQ==',
    },
  },
  {
    endpoint:
      'https://android.googleapis.com/gcm/send/frrNx6STZKI:APA91bFziNdYropcQWUtmmyyuRyWqgvJluhEfAv-__Ev9mguXnXWu54NwisaOXQJ3RBz-c-nNacBpMnzxJnX0m_AgOsuOXMC7f0YgJcBA0be3FWM3SNfTI6TUL5Wn3GOiQt5FIjCqD-8',
    keys: {
      p256dh:
        'BGaZ5l0mB8P0aPRIPYPc_sgPKi_xkdzepCN1BoH4oTjcIgVEc3fhrzCXjyiOYXKOqJAIpqmA6d_ln8M1ejK2uu0=',
      auth: '1SJ4n4n_DN4yF5V93PG_Qw==',
    },
  },
  {
    endpoint:
      'https://android.googleapis.com/gcm/send/ckyDsqe9d3E:APA91bEtUMkrLt2logv3Sngkj9nLs10EtKOxErzhFG_xcy6Hm3xW5CJqpnbrq87yWwKe2Uk0_Aj26pPGI--LUB0E2KiZJic5z_JFZAgiZc9QAMf5VXO264Q6gqkEE3C9QCSMiT_sYdhL',
    keys: {
      p256dh:
        'BD18x8dJWL7Zq74SVra3bj6vdstA6nNFncTahwHNQDh0RbB-mJcdL-Sk3ISnwlo9Y5B9abPijPoMJ-ni391JtAk=',
      auth: 'bTl-WZil4S06tN76_9iYRg==',
    },
  },
];
module.exports.goodClients = goodClients;
module.exports.badClients = [
  {
    endpoint:
      'https://android.googleapis.com/gcm/send/dcqAlHtjC84:APA91bHj7Qp1d-ZPy83313ohQaE_CSeSvczh-3Qfj1dyzkAV_K3FTSfqXH2LmS_AF9uv1TmcAneMH2MHSeqRHxo9QfoblfYODySeV_2L1kV0pEhEBbBHhXokOzVAZyvGGpT0K07rAPqx',
    keys: {
      p256dh:
        'BOAIOs5VFlB7pOVaYeAhU_ZIKtQg5NIKQ7au039IuKHdOslq8At8aXTA6ei3vEVSwh3dGKlCoIeqS-EcNidCTRgx',
      auth: '5z1_fh3BTWc7txBFut3KdQ=x',
    },
  },
];
module.exports.gcmUrl = /(gcm-http.googleapis\.com)|(android\.googleapis\.com)/;
module.exports.goodId = '57891df47bc6aff129e7fe3b';
module.exports.badIds = ['aaa', '57891df47bc6aff129e7fe3x'];
module.exports.goodIp = 'yyy';
module.exports.goodUserAgent = 'zzz';
module.exports.goodHeaderAuthorization = `${config.get('authHeader')}endpoint=${
  goodClients[0].endpoint
},p256dh=${goodClients[0].keys.p256dh},auth=${goodClients[0].keys.auth}`;

before(function(done) {
  mockgoose(mongoose)
    .then(function() {
      mongoose.connect(
        config.get('mongodbUrl'),
        {},
        function(err) {
          server = require('../index');
          done(err);
        }
      );
    })
    .catch(done);
});

afterEach(function(done) {
  nock.cleanAll();
  if (mongoose.isMocked === true) {
    mockgoose.reset(function() {
      var collections = _.keys(Mongoose.connections[0].collections);
      Promise.map(collections, function(collection) {
        return db.db.collection(collection).remove();
      })
        .then(function() {
          done();
        })
        .catch(done);
    });
  } else {
    done();
  }
});
