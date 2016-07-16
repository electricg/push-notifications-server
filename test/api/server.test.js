/* global describe, it */
var rewire = require('rewire');

describe('API Server', function() {
  it('should throw error', function(done) {
    var server = rewire('../../src/server');
    server.start()
    .then(function() {
      done('there should be an error');
    })
    .catch(function() {
      done();
    });
  });
});