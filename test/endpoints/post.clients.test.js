/* global describe, it */
var Promise = require('bluebird');
var nock = require('nock');
var request = require('request');
var should = require('should');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');

var endpoint = '/clients';
var method = 'POST';
var baseUrl = 'http://' + helper.config.host + ':' + helper.config.port;

describe(method + ' ' + endpoint, function() {
  it('should fail with an empty body', function(done) {
    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('fakeParam').should.not.equal(-1);
        done();
      }
    });
  });


  it('should fail because of not string endpoint value in payload', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.endpoint = 1;

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('keys.auth').should.not.equal(-1);
        done();
      }
    });
  });


  it('should fail and return 400 because of invalid endpoint', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.endpoint = 'xxx';

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal('Invalid URI "' + payload.endpoint + '"');
        done();
      }
    });
  });


  it('should fail and return 400 because of invalid keys.p256dh', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.p256dh = 'xxx';

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal('Subscription\'s client key (p256dh) is invalid.');
        done();
      }
    });
  });


  it('should fail and return 400 because of invalid keys.auth', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.auth = 'xxx';

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal('Subscription\'s Auth token is not 16 bytes.');
        done();
      }
    });
  });


  it('should fail and return 400 because of unauthorized endpoint', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.endpoint = helper.badClients[0].endpoint;

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    var errorCode = 400;
    var errorMessage = 'UnauthorizedRegistration';

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
        .replyWithError({ statusCode: errorCode, statusMessage: errorMessage });

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal(errorCode + ' ' + errorMessage);
        done();
      }
    });
  });


  it('should fail and return 400 because of unauthorized keys.p256dh', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.p256dh = helper.badClients[0].keys.p256dh;

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal('Subscription\'s client key (p256dh) is invalid.');
        done();
      }
    });
  });


  it('should fail and return 400 because of unauthorized keys.auth', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);
    payload.keys.auth = helper.badClients[0].keys.auth;

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    var errorCode = 400;
    var errorMessage = 'UnauthorizedRegistration';

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
        .replyWithError({ statusCode: errorCode, statusMessage: errorMessage });

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal(errorCode + ' ' + errorMessage);
        done();
      }
    });
  });


  it('should fail and return 400 because of an error with GCM server', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    var errorCode = 400;
    var errorMessage = 'Fake Error';

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
        .replyWithError({ statusCode: errorCode, statusMessage: errorMessage });

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 400;

    var errorCode = 404;

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
        .replyWithError(errorCode);

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error registering subscription to GCM');
        body.details.should.equal(errorCode + '');
        done();
      }
    });
  });


  it('should succeed to register a valid client', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 200;

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
        .reply(201);

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(1);
        should.exist(body.id);
        done();
      }
    });
  });


  it('should fail and return 500 because of a problem with the db', function(done) {
    var payload = _.cloneDeep(helper.goodClients[0]);

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 500;

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
        .reply(201);

    var revert = sinon.stub(helper.db.collection, 'insert', function() {
      return Promise.reject(new Error('fake db error'));
    });

    request(options, function(err, response) {
      revert.restore();
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 500;

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
        .reply(201);

    var revert = sinon.stub(helper.db.collection, 'insert', function() {
      return Promise.resolve({
        result: {
          ok: 0,
          n: 0
        }
      });
    });

    request(options, function(err, response) {
      revert.restore();
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.error.should.equal('Error inserting the data');
        done();
      }
    });
  });
});