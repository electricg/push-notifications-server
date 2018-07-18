/* global describe, it */
var joi = require('joi');
var rewire = require('rewire');
var helper = require('../helper');

var validation = rewire('../../src/validation');
var authHeader = validation.__get__('authHeader');

describe('Validation', function() {
  describe('of authorization header', function() {
    it('should fail with no scheme', function(done) {
      var input = `p256dh=${helper.goodClients[0].keys.p256dh},auth=${
        helper.goodClients[0].keys.auth
      }`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done();
      }
      done('Should have returned an error');
    });

    it('should fail with no endpoint', function(done) {
      var input = `${helper.config.get('authHeader')}p256dh=${
        helper.goodClients[0].keys.p256dh
      },auth=${helper.goodClients[0].keys.auth}`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done();
      }
      done('Should have returned an error');
    });

    it('should fail with no p256dh', function(done) {
      var input = `${helper.config.get('authHeader')}endpoint=${
        helper.goodClients[0].endpoint
      },auth=${helper.goodClients[0].keys.auth}`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done();
      }
      done('Should have returned an error');
    });

    it('should fail with no auth', function(done) {
      var input = `${helper.config.get('authHeader')}endpoint=${
        helper.goodClients[0].endpoint
      },p256dh=${helper.goodClients[0].keys.p256dh}`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done();
      }
      done('Should have returned an error');
    });

    it('should fail with bad scheme', function(done) {
      var input = `X${helper.config.get('authHeader')}p256dh=${
        helper.goodClients[0].keys.p256dh
      },auth=${helper.goodClients[0].keys.auth}`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done();
      }
      done('Should have returned an error');
    });

    it('should fail with bad endpoint', function(done) {
      var input =
        `${helper.config.get('authHeader')}endpoint=` +
        `http://xxx` +
        `,p256dh=${helper.goodClients[0].keys.p256dh},auth=${
          helper.goodClients[0].keys.auth
        }`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done();
      }
      done('Should have returned an error');
    });

    it('should fail with bad p256dh', function(done) {
      var input =
        `${helper.config.get('authHeader')}endpoint=${
          helper.goodClients[0].endpoint
        },p256dh=` +
        `bad_character!` +
        `,auth=${helper.goodClients[0].keys.auth}`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done();
      }
      done('Should have returned an error');
    });

    it('should fail with bad auth', function(done) {
      var input =
        `${helper.config.get('authHeader')}endpoint=${
          helper.goodClients[0].endpoint
        },p256dh=${helper.goodClients[0].keys.p256dh},auth=` + `bad_character!`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done();
      }
      done('Should have returned an error');
    });

    it('should succeed with good value', function(done) {
      var input = `${helper.config.get('authHeader')}endpoint=${
        helper.goodClients[0].endpoint
      },p256dh=${helper.goodClients[0].keys.p256dh},auth=${
        helper.goodClients[0].keys.auth
      }`;
      var output = joi.validate(input, authHeader);
      if (output.error) {
        return done(output.error);
      }
      var res = output.value;
      res.endpoint.should.equal(helper.goodClients[0].endpoint);
      res.auth.should.equal(helper.goodClients[0].keys.auth);
      res.p256dh.should.equal(helper.goodClients[0].keys.p256dh);
      done();
    });
  });
});
