/* global describe, it */
var Promise = require('bluebird');
var request = require('request');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');

var endpoint = '/clients';
var method = 'GET';
var baseUrl = 'http://' + helper.config.host + ':' + helper.config.port;

describe(method + ' ' + endpoint, function() {
  it('should fail and return 500 because of a problem with the db', function(done) {
    var revert = sinon.stub(helper.dbCollection, 'find', function() {
      return {
        toArray: function() {
          return Promise.reject(new Error('fake db error'));
        }
      };
    });

    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 500;

    request(options, function(err, response) {
      revert.restore();
      if (err) {
        done(err);
      }
      else {
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
      baseUrl: baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 200;
    
    var data = _.cloneDeep(helper.goodClient);
    data.forEach(function(item) {
      item.date = new Date();
    });

    helper.dbCollection.insert(data)
    .then(function() {
      request(options, function(err, response) {
        if (err) {
          done(err);
        }
        else {
          response.statusCode.should.equal(statusCode);
          var body = response.body;
          Array.isArray(body).should.equal(true);
          body.length.should.equal(data.length);
          done();
        }
      });
    })
    .catch(done);
  });


  it('should succeed to return an empty array of clients', function(done) {
    var options = {
      method: method,
      baseUrl: baseUrl,
      url: endpoint,
      json: true
    };
    var statusCode = 200;

    request(options, function(err, response) {
      if (err) {
        done(err);
      }
      else {
        response.statusCode.should.equal(statusCode);
        var body = response.body;
        Array.isArray(body).should.equal(true);
        body.length.should.equal(0);
        done();
      }
    });
  });
});