/* global describe, it */
var Promise = require('bluebird');
var request = require('request');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');

var endpoint = '/client';
var method = 'DELETE';

describe(method + ' ' + endpoint, function() {
  it('should fail with no id', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 404;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Not Found');
        done();
      }
    });
  });


  it('should fail with an invalid id', function(done) {
    var id = 'xxx';
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint + '/' + id,
      json: true
    };
    var statusCode = 404;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Not Found');
        done();
      }
    });
  });


  it('should fail because no Authorization header is sent', function(done) {
    var id = '57891df47bc6aff129e7fe3b';
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint + '/' + id,
      json: true
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


  it('should fail because an invalid Authorization header is sent', function(done) {
    var id = '57891df47bc6aff129e7fe3b';
    var headers = { 'Authorization': 'xxx' };
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint + '/' + id,
      json: true,
      headers: headers
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


  it('should fail because no key values in Authorization header are sent', function(done) {
    var id = '57891df47bc6aff129e7fe3b';
    var headers = { 'Authorization': helper.config.get('authHeader') };
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint + '/' + id,
      json: true,
      headers: headers
    };
    var statusCode = 404;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        response.statusCode.should.equal(statusCode);
        var body = response.body;
        body.error.should.equal('Not Found');
        done();
      }
    });
  });


  it('should fail because the Authorization header does not match the id in the db', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 404;

    var data = _.cloneDeep(helper.goodClients[0]);
    data.date = new Date();

    helper.collectionClients.insert(data)
    .then(function(doc) {
      var res = doc.ops[0];
      var id = res._id;
      var endpoint = res.endpoint + 'x';
      var p256dh = res.keys.p256dh;
      var auth = res.keys.auth;
      options.url += '/' + id;
      options.headers = {
        'Authorization': helper.config.get('authHeader') + 'endpoint=' + endpoint + ',p256dh=' + p256dh + ',auth=' + auth
      };
      request(options, function(err, response) {
        if (err) {
          done(err);
        }
        else {
          response.statusCode.should.equal(statusCode);
          var body = response.body;
          body.error.should.equal('Not Found');
          done();
        }
      });
    })
    .catch(done);
  });


  it('should fail and return 500 because of a problem with the db', function(done) {
    var id = '57891df47bc6aff129e7fe3b';
    var headers = { 'Authorization': helper.config.get('authHeader') };
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint + '/' + id,
      json: true,
      headers: headers
    };
    var statusCode = 500;

    var revert = sinon.stub(helper.collectionClients, 'update', function() {
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


  it('should fail and return 500 because of a problem with deleting the data from the db', function(done) {
    var id = '57891df47bc6aff129e7fe3b';
    var headers = { 'Authorization': helper.config.get('authHeader') };
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint + '/' + id,
      json: true,
      headers: headers
    };
    var statusCode = 404;

    var revert = sinon.stub(helper.collectionClients, 'update', function() {
      return Promise.resolve({
        result: {
          ok: 0
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
        body.error.should.equal('Not Found');
        done();
      }
    });
  });


  it('should succeed to delete the client', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 200;

    var data = _.cloneDeep(helper.goodClients[0]);
    data.date = new Date();

    helper.collectionClients.insert(data)
    .then(function(doc) {
      var res = doc.ops[0];
      var id = res._id;
      var endpoint = res.endpoint;
      var p256dh = res.keys.p256dh;
      var auth = res.keys.auth;
      options.url += '/' + id;
      options.headers = {
        'Authorization': helper.config.get('authHeader') + 'endpoint=' + endpoint + ',p256dh=' + p256dh + ',auth=' + auth
      };
      request(options, function(err, response) {
        if (err) {
          done(err);
        }
        else {
          response.statusCode.should.equal(statusCode);
          var body = response.body;
          body.status.should.equal(1);
          done();
        }
      });
    })
    .catch(done);
  });
});