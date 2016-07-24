/* global describe, it */
var Promise = require('bluebird');
var nock = require('nock');
var request = require('request');
var should = require('should');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');

var endpoint = '/' + helper.config.get('privatePath');
var method = 'POST';

describe(method + ' ' + endpoint, function() {
  it('should fail with an empty body', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
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


  it('should fail because of no key value in payload', function(done) {
    var payload = {
      msg: 'xxx'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
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
        body.validation.keys.indexOf('key').should.not.equal(-1);
        done();
      }
    });
  });


  it('should fail because of no msg value in payload', function(done) {
    var payload = {
      key: 'xxx'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
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
        body.validation.keys.indexOf('msg').should.not.equal(-1);
        done();
      }
    });
  });


  it('should fail because of additional value in payload not expected', function(done) {
    var payload = {
      key: 'xxx',
      msg: 'xxx',
      fakeParam: 'xxx'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
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


  it('should fail because of not string key value in payload', function(done) {
    var payload = {
      key: 1,
      msg: 'xxx'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
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
        body.validation.keys.indexOf('key').should.not.equal(-1);
        done();
      }
    });
  });


  it('should fail because of not string msg value in payload', function(done) {
    var payload = {
      key: 'xxx',
      msg: 1
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
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
        body.validation.keys.indexOf('msg').should.not.equal(-1);
        done();
      }
    });
  });


  it('should fail and return 401 because of not valid key', function(done) {
    var payload = {
      key: helper.config.get('privateAuth') + 'x',
      msg: 'xxx'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 401;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        response.statusCode.should.equal(statusCode);
        done();
      }
    });
  });


  it('should fail and return 500 because of a problem with the db', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 500;

    var revert = sinon.stub(helper.db.collection, 'find', function() {
      return {
        toArray: function() {
          return Promise.reject(new Error('fake db error'));
        }
      };
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


  it('should succeed with no clients registered', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 200;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.message.should.equal('No keys registered');
        done();
      }
    });
  });


  it('should succeed with all clients succeeding', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
      title: 'yyy'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 200;

    var data = _.cloneDeep(helper.goodClients);
    data.push(_.cloneDeep(helper.goodClients[0]));
    data.forEach(function(item) {
      item.status = true;
    });

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx').times(data.length)
        .reply(201);

    helper.db.collection.insert(data)
    .then(function() {
      request(options, function(err, response) {
        if (err) {
          done(err);
        }
        else {
          var body = response.body;
          response.statusCode.should.equal(statusCode);
          body.status.should.equal(1);
          body.succeeded.should.equal(2);
          body.failed.should.equal(0);
          done();
        }
      });
    })
    .catch(done);
  });


  it('should succeed with active clients succeeding', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
      title: 'yyy'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 200;

    var data = _.cloneDeep(helper.goodClients);
    data.push(_.cloneDeep(helper.goodClients[0]));
    data.push(_.cloneDeep(helper.goodClients[0]));
    data[0].status = true;
    data[1].status = true;
    data[2].status = false;

    nock(helper.gcmUrl)
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx').times(data.length)
        .reply(201);

    helper.db.collection.insert(data)
    .then(function() {
      request(options, function(err, response) {
        if (err) {
          done(err);
        }
        else {
          var body = response.body;
          response.statusCode.should.equal(statusCode);
          body.status.should.equal(1);
          body.succeeded.should.equal(2);
          body.failed.should.equal(0);
          done();
        }
      });
    })
    .catch(done);
  });


  it('should succeed with at least one client failing', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
      title: 'yyy'
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload
    };
    var statusCode = 200;

    var data = _.cloneDeep(helper.goodClients);
    data.push(_.cloneDeep(helper.goodClients[0]));
    data.push(_.cloneDeep(helper.goodClients[0]));
    data[1].endpoint += 'x';
    data[2].endpoint += 'x';
    data.forEach(function(item) {
      item.status = true;
    });
    var goodP = helper.goodClients[0].endpoint.split('/').pop();

    nock(helper.gcmUrl)
      .filteringPath(function(p) {
        var myP = p.split('/').pop();
        if (myP === goodP) {
          return '/xxx';
        }
        else {
          return '/yyy';
        }
      })
      .post('/xxx')
        .reply(201)
      .post('/yyy').times(2)
        .replyWithError({ statusCode: 400, statusMessage: 'UnauthorizedRegistration' });

    helper.db.collection.insert(data)
    .then(function() {
      request(options, function(err, response) {
        if (err) {
          done(err);
        }
        else {
          var body = response.body;
          response.statusCode.should.equal(statusCode);
          body.status.should.equal(0);
          body.succeeded.should.equal(1);
          body.failed.should.equal(2);
          done();
        }
      });
    })
    .catch(done);
  });
});