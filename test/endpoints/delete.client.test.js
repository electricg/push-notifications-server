/* global describe, it */
var Promise = require('bluebird');
var request = require('request');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');

var endpoint = '/client';
var method = 'DELETE';
var baseUrl = 'http://' + helper.config.host + ':' + helper.config.port;

describe(method + ' ' + endpoint, function() {
  it('should fail with no id', function(done) {
    var options = {
      method: method,
      baseUrl: baseUrl,
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
      baseUrl: baseUrl,
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


  it('should fail and return 500 because of a problem with the db', function(done) {
    var id = '57891df47bc6aff129e7fe3b';
    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint + '/' + id,
      json: true
    };
    var statusCode = 500;

    var revert = sinon.stub(helper.dbCollection, 'remove', function() {
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
    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint + '/' + id,
      json: true
    };
    var statusCode = 500;

    var revert = sinon.stub(helper.dbCollection, 'remove', function() {
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
        body.error.should.equal('Error deleting the data');
        done();
      }
    });
  });


  it('should succeed to delete the client', function(done) {
    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 200;

    var data = _.cloneDeep(helper.goodClient[0]);
    data.date = new Date();

    helper.dbCollection.insert(data)
    .then(function(doc) {
      var id = doc.ops[0]._id;
      options.url += '/' + id;
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