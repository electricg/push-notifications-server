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
  .file(`${__dirname}/../config.json`)
  .defaults(DEFAULT);

// some of the settings need parsing, so we create a public layer accessible to the application, while hiding the original ones
nconf.set('public:port', ~~nconf.get('PORT'));
nconf.set('public:host', nconf.get('HOST'));
nconf.set('public:mongodbUrl', nconf.get('MONGODB_URI'));
nconf.set('public:allowedOrigins', utils.formatOrigins(nconf.get('CLIENTS')));
nconf.set('public:privateAuth', nconf.get('PRIVATE_AUTH'));
nconf.set('public:privatePath', nconf.get('PRIVATE_PATH'));
nconf.set('public:gcmAuth', nconf.get('GCM_AUTH'));
nconf.set('public:collectionClients', nconf.get('COLLECTION_CLIENTS'));
nconf.set('public:collectionMessages', nconf.get('COLLECTION_MESSAGES'));
nconf.set('public:welcomeMsg', nconf.get('WELCOME_MSG'));
nconf.set(
  'public:publicList',
  nconf.get('PUBLIC_LIST') === 'true' || nconf.get('PUBLIC_LIST') === true
);
nconf.set('public:authHeader', nconf.get('AUTH_HEADER'));

module.exports.get = function(param) {
  return nconf.get(`public:${param}`);
};
