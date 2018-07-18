// Static endpoint for checking server status and debugging
var pkg = require('../../package.json');

module.exports.handler = function(request, reply) {
  reply({ status: 1, version: pkg.version });
};
