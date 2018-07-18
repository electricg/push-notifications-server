/* global describe, it, before, after */
var Promise = require('bluebird');
var request = require('request');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');
var collection = require('../../src/collections/clients');

var endpoint = '/clients';
var method = 'GET';

describe(`${method} ${endpoint} enabled`, function() {
  var getConfigStub;
  before(function(done) {
    getConfigStub = sinon.stub(helper.config, 'get');
    getConfigStub.withArgs('publicList').returns(true);
    done();
  });

  after(function(done) {
    getConfigStub.restore();
    done();
  });

  it('should fail and return 500 because of a problem with the db', function(done) {
    var revert = sinon.stub(helper.collectionClients, 'find', function() {
      return {
        toArray: function() {
          return Promise.reject(new Error('fake db error'));
        },
      };
    });

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 500;

    request(options, function(err, response) {
      revert.restore();
      if (err) {
        done(err);
      } else {
        response.statusCode.should.equal(statusCode);
        var body = response.body;
        body.status.should.equal(0);
        body.error.should.equal('Internal MongoDB error');
        body.details.should.equal('fake db error');
        done();
      }
    });
  });

  it('should succeed to return an array of clients', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 200;

    var data = _.cloneDeep(helper.goodClients[0]);
    data.ip = helper.goodIp;
    data.userAgent = helper.goodUserAgent;

    collection
      .add(data)
      .then(function() {
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
            response.statusCode.should.equal(statusCode);
            var body = response.body;
            Array.isArray(body).should.equal(true);
            body.length.should.equal(1);
            body[0].endpoint.should.equal(data.endpoint);
            body[0].keys.p256dh.should.equal(data.keys.p256dh);
            body[0].keys.auth.should.equal(data.keys.auth);
            body[0].subscribed.ip.should.equal(helper.goodIp);
            body[0].subscribed.userAgent.should.equal(helper.goodUserAgent);
            (typeof body[0].subscribed.date).should.equal('string');
            body[0].status.should.equal(true);
            done();
          }
        });
      })
      .catch(done);
  });

  it('should succeed to return an empty array of clients', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 200;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        response.statusCode.should.equal(statusCode);
        var body = response.body;
        Array.isArray(body).should.equal(true);
        body.length.should.equal(0);
        done();
      }
    });
  });
});

describe(`${method} ${endpoint} disabled`, function() {
  var getConfigStub;
  before(function(done) {
    getConfigStub = sinon.stub(helper.config, 'get');
    getConfigStub.withArgs('publicList').returns(false);
    done();
  });

  after(function(done) {
    getConfigStub.restore();
    done();
  });

  it('should fail and return 401', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 401;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        response.statusCode.should.equal(statusCode);
        done();
      }
    });
  });
});
