/* global describe, it */
var Promise = require('bluebird');
var nock = require('nock');
var request = require('request');
var should = require('should');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');
var collection = require('../../src/collections/clients');

var endpoint = '/clients';
var method = 'POST';

describe(`${method} ${endpoint}`, function() {
  it('should fail with an empty body', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        done();
      }
    });
  });

  it('should fail because of no endpoint value in payload', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    delete payload.endpoint;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('endpoint').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of no keys.p256dh value in payload', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    delete payload.keys.p256dh;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('keys.p256dh').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of no keys.auth value in payload', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    delete payload.keys.auth;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('keys.auth').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of additional value in payload not expected', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.fakeParam = 'xxx';

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('fakeParam').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of additional value in payload keys not expected', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.fakeParam = 'xxx';

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('keys.fakeParam').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of not string endpoint value in payload', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.endpoint = 1;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('endpoint').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of not string keys.p256dh value in payload', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.p256dh = 1;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('keys.p256dh').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of not string keys.auth value in payload', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.auth = 1;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('keys.auth').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail and return 400 because of invalid endpoint scheme', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.endpoint = 'http://android.googleapis.com';

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('endpoint').should.not.equal(-1);
        response.statusCode.should.equal(statusCode);
        done();
      }
    });
  });

  it('should fail and return 400 because of invalid keys.p256dh', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.p256dh = 'xxx';

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal('userPublicKey should be 65 bytes long.');
        done();
      }
    });
  });

  it('should fail and return 400 because of invalid keys.auth', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.auth = 'xxx';

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal('userAuth should be at least 16 bytes long');
        done();
      }
    });
  });

  it('should fail and return 400 because of unauthorized endpoint', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.endpoint = helper.badClients[0].endpoint;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    var errorCode = 400;
    var errorMessage = 'UnauthorizedRegistration';

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .replyWithError({ statusCode: errorCode, statusMessage: errorMessage });

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal(`${errorCode} ${errorMessage}`);
        done();
      }
    });
  });

  it('should fail and return 400 because of unauthorized keys.p256dh', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.p256dh = helper.badClients[0].keys.p256dh;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal('userPublicKey should be 65 bytes long.');
        done();
      }
    });
  });

  it('should fail and return 400 because of unauthorized keys.auth', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.auth = helper.badClients[0].keys.auth;

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    var errorCode = 400;
    var errorMessage = 'UnauthorizedRegistration';

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .replyWithError({ statusCode: errorCode, statusMessage: errorMessage });

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal(`${errorCode} ${errorMessage}`);
        done();
      }
    });
  });

  it('should fail and return 400 because of an error with GCM server', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    var errorCode = 400;
    var errorMessage = 'Fake Error';

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .replyWithError({ statusCode: errorCode, statusMessage: errorMessage });

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal('400 Fake Error');
        done();
      }
    });
  });

  it('should fail and return 400 because GCM server was unreachable', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 400;

    var errorCode = 404;

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .replyWithError(errorCode);

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal(`${errorCode}`);
        done();
      }
    });
  });

  it('should succeed to register a valid client', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 200;

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .reply(201);

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(1);
        should.exist(body.id);
        done();
      }
    });
  });

  it('should fail to register a valid client when it is already in the db', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 401;

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .reply(201);

    collection
      .add(payload)
      .then(function() {
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
            response.statusCode.should.equal(statusCode);
            done();
          }
        });
      })
      .catch(done);
  });

  it('should fail and return 500 because of a problem with the db', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 500;

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .reply(201);

    var revert = sinon
      .stub(helper.collectionClients, 'insert')
      .callsFake(function() {
        return Promise.reject(new Error('fake db error'));
      });

    request(options, function(err, response) {
      revert.restore();
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Internal MongoDB error');
        body.details.should.equal('fake db error');
        done();
      }
    });
  });

  it('should fail and return 500 because of a problem with inserting the data into the db', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 500;

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .reply(201);

    var revert = sinon
      .stub(helper.collectionClients, 'insert')
      .callsFake(function() {
        return Promise.resolve({
          result: {
            ok: 0,
          },
        });
      });

    request(options, function(err, response) {
      revert.restore();
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error inserting the data');
        done();
      }
    });
  });
});
