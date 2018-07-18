// Show page to send message to all subscriptions
var fs = require('fs');
var specialHtml = fs.readFileSync('public/special.html', 'utf8');

module.exports.handler = function(request, reply) {
  return reply(specialHtml);
};
