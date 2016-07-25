/* global describe, it */
var request = require('request');
var helper = require('../helper');
var package = require('../../package.json');

var endpoint = '/info';
var method = 'GET';

describe(method + ' ' + endpoint, function() {
  it('should succeed to return server informations', function(done) {
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
        body.status.should.equal(1);
        body.version.should.equal(package.version);
        done();
      }
    });
  });
});