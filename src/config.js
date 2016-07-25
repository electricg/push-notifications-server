var nconf = require('nconf');
var utils = require('./utils');

var DEFAULT = {
  PORT: 8083,
  HOST: '127.0.0.1',
  MONGODB_URI: 'mongodb://localhost:27017/clients',
  CLIENTS: 'http://localhost:8085',
  PRIVATE_AUTH: 'xxx', // secret word to allow push endpoint
  PRIVATE_PATH: 'special', // secret path of the push endpoint
  GCM_AUTH: 'xxx', // GCM API key
  COLLECTION_CLIENTS: 'clients',
  COLLECTION_MESSAGES: 'messages',
  WELCOME_MSG: 'You have successfully subscribed to ELECTRIC_G notifications!',
  PUBLIC_LIST: false,
  AUTH_HEADER: 'PUSH-NOTIFICATION ',
};

nconf
  .env()
  .file(__dirname + '/../config.json')
  .defaults(DEFAULT)
;

nconf.set('port', ~~nconf.get('PORT'));
nconf.set('host', nconf.get('HOST'));
nconf.set('mongodbUrl', nconf.get('MONGODB_URI'));
nconf.set('allowedOrigins', utils.formatOrigins(nconf.get('CLIENTS')));
nconf.set('privateAuth', nconf.get('PRIVATE_AUTH'));
nconf.set('privatePath', nconf.get('PRIVATE_PATH'));
nconf.set('gcmAuth', nconf.get('GCM_AUTH'));
nconf.set('collectionClients', nconf.get('COLLECTION_CLIENTS'));
nconf.set('collectionMessages', nconf.get('COLLECTION_MESSAGES'));
nconf.set('welcomeMsg', nconf.get('WELCOME_MSG'));
nconf.set('publicList', nconf.get('PUBLIC_LIST') === 'true' || nconf.get('PUBLIC_LIST') === true);
nconf.set('authHeader', nconf.get('AUTH_HEADER'));

module.exports.get = function(param) {
  var arr = ['port', 'host', 'mongodbUrl', 'allowedOrigins', 'privateAuth', 'privatePath', 'gcmAuth', 'collectionClients', 'collectionMessages', 'welcomeMsg', 'publicList', 'authHeader'];
  if (arr.indexOf(param) !== -1) {
    return nconf.get(param);
  }
};