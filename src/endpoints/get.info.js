// Static endpoint for checking server status and debugging
module.exports.handler = function(request, reply) {
  console.log('info');
  reply({ status: 1, version: '1.0.0' });
};