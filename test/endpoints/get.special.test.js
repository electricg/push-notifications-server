/* global describe, it */
var request = require('request');
var helper = require('../helper');

var endpoint = '/' + helper.config.get('privatePath');
var method = 'GET';

describe(method + ' ' + endpoint, function() {
  it('should succeed to return the admin page', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 200;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        response.statusCode.should.equal(statusCode);
        var body = response.body;
        var fs = require('fs');
        var specialHtml = fs.readFileSync('public/special.html', 'utf8');
        body.should.equal(specialHtml);
        done();
      }
    });
  });
});