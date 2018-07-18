/* global describe, it */
var config = require('../../src/config');

describe('Config', function() {
  it('should return a valid setting', function(done) {
    var c = config.get('port');
    (typeof c).should.equal('number');
    done();
  });

  it('should return undefined for an invalid setting', function(done) {
    var c = config.get('xxx');
    (typeof c).should.equal('undefined');
    done();
  });
});
