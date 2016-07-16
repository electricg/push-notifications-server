var utils = require('./utils');

module.exports = {
  port: ~~process.env.PORT || 8082,
  host: process.env.HOST || '127.0.0.1',
  mongodbUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/clients',
  allowedOrigins: utils.formatOrigins(process.env.CLIENT || 'http://localhost:8085'),
  privateAuth: process.env.PRIVATE_AUTH || 'xxx', // secret word to allow push endpoint
  privatePath: process.env.PRIVATE_PATH || 'special', // secret path of the push endpoint
  gcmAuth: process.env.GCM_AUTH || 'xxx', // GCM API key
  collectionName: 'clients',
  welcomeMsg: 'You have successfully subscribed to ELECTRIC_G notifications!',
};