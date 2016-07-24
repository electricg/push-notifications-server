// Static endpoint for checking server status and debugging
var package = require('../../package.json');

module.exports.handler = function(request, reply) {
  console.log('info');
  reply({ status: 1, version: package.version });
};