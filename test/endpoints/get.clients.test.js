/* global describe, it */
/* exported helper */
var request = require('request');
var helper = require('../helper');

var endpoint = '/clients';
var method = 'GET';
var baseUrl = 'http://' + helper.config.host + ':' + helper.config.port;

describe(method + ' ' + endpoint, function() {
  it('should succeed to return empty array of clients', function(done) {
    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true
    };

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        response.statusCode.should.equal(200);
        var body = response.body;
        Array.isArray(body).should.equal(true);
        body.length.should.equal(0);
        done();
      }
    });
  });
});