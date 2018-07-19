/* global describe, it */
var request = require('request');
var should = require('should');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');
var collection = require('../../src/collections/clients');

var endpoint = '/client';
var method = 'DELETE';

describe(`${method} ${endpoint}`, function() {
  it('should fail with no id', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 404;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.error.should.equal('Not Found');
        done();
      }
    });
  });

  helper.badIds.forEach(function(id) {
    it(`should fail with invalid id: ${id}`, function(done) {
      var headers = { Authorization: helper.goodHeaderAuthorization };
      var options = {
        method: method,
        baseUrl: helper.baseUrl,
        url: `${endpoint}/${id}`,
        json: true,
        headers: headers,
      };
      var statusCode = 400;

      request(options, function(err, response) {
        if (err) {
          done(err);
        } else {
          response.statusCode.should.equal(statusCode);
          var body = response.body;
          body.error.should.equal('Bad Request');
          should.exist(body.validation);
          body.validation.keys.indexOf('id').should.not.equal(-1);
          done();
        }
      });
    });
  });

  it('should fail because no Authorization header is sent', function(done) {
    var id = helper.goodId;
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        response.statusCode.should.equal(statusCode);
        var body = response.body;
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('authorization').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because an invalid Authorization header is sent', function(done) {
    var id = helper.goodId;
    var headers = { Authorization: 'xxx' };
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      headers: headers,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        response.statusCode.should.equal(statusCode);
        var body = response.body;
        body.error.should.equal('Bad Request');
        should.exist(body.validation);
        body.validation.keys.indexOf('authorization').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because no key values in Authorization header are sent', function(done) {
    var id = helper.goodId;
    var headers = { Authorization: helper.config.get('authHeader') };
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      headers: headers,
    };
    var statusCode = 400;

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        response.statusCode.should.equal(statusCode);
        done();
      }
    });
  });

  it('should fail because the Authorization header endpoint does not match the one in the db', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 404;

    var data = _.cloneDeep(helper.goodClients[0]);

    collection
      .add(data)
      .then(function(res) {
        var id = res._id;
        var endpoint = `${res.endpoint}x`;
        var p256dh = res.keys.p256dh;
        var auth = res.keys.auth;
        options.url += `/${id.toString()}`;
        options.headers = {
          Authorization: `${helper.config.get(
            'authHeader'
          )}endpoint=${endpoint},p256dh=${p256dh},auth=${auth}`,
        };
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
            response.statusCode.should.equal(statusCode);
            var body = response.body;
            body.error.should.equal('Not Found');
            done();
          }
        });
      })
      .catch(done);
  });

  it('should fail because the Authorization header p256dh does not match the one in the db', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 404;

    var data = _.cloneDeep(helper.goodClients[0]);

    collection
      .add(data)
      .then(function(res) {
        var id = res._id;
        var endpoint = res.endpoint;
        var p256dh = `${res.keys.p256dh}x`;
        var auth = res.keys.auth;
        options.url += `/${id.toString()}`;
        options.headers = {
          Authorization: `${helper.config.get(
            'authHeader'
          )}endpoint=${endpoint},p256dh=${p256dh},auth=${auth}`,
        };
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
            response.statusCode.should.equal(statusCode);
            var body = response.body;
            body.error.should.equal('Not Found');
            done();
          }
        });
      })
      .catch(done);
  });

  it('should fail because the Authorization header auth does not match the one in the db', function(done) {
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
    };
    var statusCode = 404;

    var data = _.cloneDeep(helper.goodClients[0]);

    collection
      .add(data)
      .then(function(res) {
        var id = res._id;
        var endpoint = res.endpoint;
        var p256dh = res.keys.p256dh;
        var auth = `${res.keys.auth}x`;
        options.url += `/${id.toString()}`;
        options.headers = {
          Authorization: `${helper.config.get(
            'authHeader'
          )}endpoint=${endpoint},p256dh=${p256dh},auth=${auth}`,
        };
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
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
    var id = helper.goodId;
    var headers = { Authorization: helper.goodHeaderAuthorization };
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      headers: headers,
    };
    var statusCode = 500;

    var revert = sinon
      .stub(helper.collectionClients, 'update')
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

  it('should fail and return 500 because of a problem with updating the data in the db', function(done) {
    var id = helper.goodId;
    var headers = { Authorization: helper.goodHeaderAuthorization };
    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      headers: headers,
    };
    var statusCode = 404;

    var revert = sinon
      .stub(helper.collectionClients, 'update')
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
        body.error.should.equal('Not Found');
        done();
      }
    });
  });

  it('should succeed to remove the client', function(done) {
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
    var createdId;
    var unsubIp = `${helper.goodIp}2`;
    var unsubUserAgent = `${helper.goodUserAgent}2`;

    collection
      .add(data)
      .then(function(res) {
        // check value inserted in the db first
        try {
          createdId = helper.db.ObjectId(res._id);
        } catch (e) {
          should.not.exist(e);
        }
        res.endpoint.should.equal(data.endpoint);
        res.keys.p256dh.should.equal(data.keys.p256dh);
        res.keys.auth.should.equal(data.keys.auth);
        res.subscribed.ip.should.equal(helper.goodIp);
        res.subscribed.userAgent.should.equal(helper.goodUserAgent);
        (typeof res.subscribed.date).should.equal('object');
        res.status.should.equal(true);

        var endpoint = res.endpoint;
        var p256dh = res.keys.p256dh;
        var auth = res.keys.auth;
        options.url += `/${createdId.toString()}`;
        options.headers = {
          Authorization: `${helper.config.get(
            'authHeader'
          )}endpoint=${endpoint},p256dh=${p256dh},auth=${auth}`,
          'User-Agent': unsubUserAgent,
          'X-Forwarded-For': unsubIp,
        };
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
            // check value updated in the db
            helper.collectionClients
              .findOne({ _id: createdId })
              .then(function(res) {
                res.endpoint.should.equal(data.endpoint);
                res.keys.p256dh.should.equal(data.keys.p256dh);
                res.keys.auth.should.equal(data.keys.auth);
                res.status.should.equal(false);
                res.subscribed.ip.should.equal(helper.goodIp);
                res.subscribed.userAgent.should.equal(helper.goodUserAgent);
                (typeof res.subscribed.date).should.equal('object');
                res.unsubscribed.ip.should.equal(unsubIp);
                res.unsubscribed.userAgent.should.equal(unsubUserAgent);
                (typeof res.unsubscribed.date).should.equal('object');
              })
              .catch(done);

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
