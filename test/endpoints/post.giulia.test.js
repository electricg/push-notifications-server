/* global describe, it, should */
var request = require('request');
var helper = require('../helper');

var endpoint = '/giulia';
var method = 'POST';

describe(`${method} ${endpoint}`, function() {
  it('should succeed with an empty body', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };

    var expectedStatusCode = 200;
    var expectedBody = {
      status: 1,
      payload: null,
      headers: {
        accept: 'application/json',
        connection: 'close',
        'content-length': '0',
        host: '127.0.0.1:8083',
      },
    };

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        const { statusCode, body } = response;
        should.deepEqual(statusCode, expectedStatusCode);
        should.deepEqual(body, expectedBody);
        done();
      }
    });
  });

  it('should succeed with not empty body', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: {
        test: 'abc',
      },
    };

    var expectedStatusCode = 200;
    var expectedBody = {
      status: 1,
      payload: {
        test: 'abc',
      },
      headers: {
        accept: 'application/json',
        connection: 'close',
        'content-length': '14',
        'content-type': 'application/json',
        host: '127.0.0.1:8083',
      },
    };

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        const { statusCode, body } = response;
        should.deepEqual(statusCode, expectedStatusCode);
        should.deepEqual(body, expectedBody);
        done();
      }
    });
  });
});
