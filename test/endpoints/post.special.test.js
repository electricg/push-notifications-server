/* global describe, it */
var Promise = require('bluebird');
var nock = require('nock');
var request = require('request');
var rewire = require('rewire');
var should = require('should');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require('../helper');
var collection = require('../../src/collections/clients');

var validation = rewire('../../src/validation');
var max = validation.__get__('max');

var endpoint = `/${helper.config.get('privatePath')}`;
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

  it('should fail because of no key value in payload', function(done) {
    var payload = {
      msg: 'xxx',
    };

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
        body.validation.keys.indexOf('key').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of no msg value in payload', function(done) {
    var payload = {
      key: 'xxx',
    };

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
        body.validation.keys.indexOf('msg').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of additional value in payload not expected', function(done) {
    var payload = {
      key: 'xxx',
      msg: 'xxx',
      fakeParam: 'xxx',
    };

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

  it('should fail because of not string key value in payload', function(done) {
    var payload = {
      key: 1,
      msg: 'xxx',
    };

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
        body.validation.keys.indexOf('key').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of not string msg value in payload', function(done) {
    var payload = {
      key: 'xxx',
      msg: 1,
    };

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
        body.validation.keys.indexOf('msg').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of not string title value in payload', function(done) {
    var payload = {
      key: 'xxx',
      msg: 'xxx',
      title: 1,
    };

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
        body.validation.keys.indexOf('title').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of too long title value in payload', function(done) {
    var payload = {
      key: 'xxx',
      msg: 'xxx',
      title: new Array(max.title + 2).join('x'),
    };

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
        body.validation.keys.indexOf('title').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail because of too long msg value in payload', function(done) {
    var payload = {
      key: 'xxx',
      msg: new Array(max.msg + 2).join('x'),
      title: 'xxx',
    };

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
        body.validation.keys.indexOf('msg').should.not.equal(-1);
        done();
      }
    });
  });

  it('should fail and return 401 because of not valid key', function(done) {
    var payload = {
      key: `${helper.config.get('privateAuth')}x`,
      msg: 'xxx',
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
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

  it('should fail and return 500 because of a problem with the db in the clients collection', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 500;

    var revert = sinon
      .stub(helper.collectionClients, 'find')
      .callsFake(function() {
        return {
          toArray: function() {
            return Promise.reject(new Error('fake db error'));
          },
        };
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

  it('should succeed and return 200 but with a problem with the db in the messages collection', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 200;

    var revert = sinon
      .stub(helper.collectionMessages, 'insert')
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
        body.message.should.equal('No keys registered');
        body.err.error.should.equal('Internal MongoDB error');
        body.err.details.should.equal('fake db error');
        done();
      }
    });
  });

  it('should succed and return 200 but with a problem adding the log in the messages collection', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 200;

    var revert = sinon
      .stub(helper.collectionMessages, 'insert')
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
        body.message.should.equal('No keys registered');
        body.err.error.should.equal('Internal MongoDB error');
        body.err.details.should.equal('');
        done();
      }
    });
  });

  it('should succeed with no clients registered', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 200;

    options.headers = {
      'User-Agent': helper.goodUserAgent,
      'X-Forwarded-For': helper.goodIp,
    };

    request(options, function(err, response) {
      if (err) {
        done(err);
      } else {
        var body = response.body;
        response.statusCode.should.equal(statusCode);
        body.status.should.equal(0);
        body.message.should.equal('No keys registered');

        helper.collectionMessages
          .find()
          .toArray()
          .then(function(res) {
            res.length.should.equal(1);
            res[0].msg.should.equal(payload.msg);
            res[0].title.should.equal('');
            (typeof res[0].date).should.equal('object');
            res[0].ip.should.equal(helper.goodIp);
            res[0].userAgent.should.equal(helper.goodUserAgent);
            res[0].result.status.should.equal(0);
            res[0].result.message.should.equal('No keys registered');
            done();
          })
          .catch(done);
      }
    });
  });

  it('should succeed with all clients succeeding', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
      title: 'yyy',
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 200;

    options.headers = {
      'User-Agent': helper.goodUserAgent,
      'X-Forwarded-For': helper.goodIp,
    };

    var data = _.cloneDeep(helper.goodClients);

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .times(data.length)
      .reply(201);

    Promise.map(data, function(item) {
      return collection.add(item).catch(done);
    })
      .then(function() {
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
            var body = response.body;
            response.statusCode.should.equal(statusCode);
            body.status.should.equal(1);
            body.succeeded.should.equal(data.length);
            body.failed.should.equal(0);

            helper.collectionMessages
              .find()
              .toArray()
              .then(function(res) {
                res.length.should.equal(1);
                res[0].msg.should.equal(payload.msg);
                res[0].title.should.equal(payload.title);
                (typeof res[0].date).should.equal('object');
                res[0].ip.should.equal(helper.goodIp);
                res[0].userAgent.should.equal(helper.goodUserAgent);
                res[0].result.status.should.equal(1);
                res[0].result.succeeded.should.equal(data.length);
                res[0].result.failed.should.equal(0);
                done();
              })
              .catch(done);
          }
        });
      })
      .catch(done);
  });

  it('should succeed with active clients succeeding', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 200;

    options.headers = {
      'User-Agent': helper.goodUserAgent,
      'X-Forwarded-For': helper.goodIp,
    };

    var data = _.cloneDeep(helper.goodClients);

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function() {
        return '/xxx';
      })
      .post('/xxx')
      .times(data.length)
      .reply(201);

    Promise.map(data, function(item) {
      return collection.add(item).catch(done);
    })
      .then(function(res) {
        // remove one of the clients
        var query = {
          _id: res[0]._id,
          endpoint: res[0].endpoint,
          p256dh: res[0].keys.p256dh,
          auth: res[0].keys.auth,
        };
        var update = {
          ip: helper.goodIp,
          userAgent: helper.goodUserAgent,
        };
        return collection.remove(query, update);
      })
      .then(function() {
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
            var body = response.body;
            response.statusCode.should.equal(statusCode);
            body.status.should.equal(1);
            body.succeeded.should.equal(2);
            body.failed.should.equal(0);

            helper.collectionMessages
              .find()
              .toArray()
              .then(function(res) {
                res.length.should.equal(1);
                res[0].msg.should.equal(payload.msg);
                res[0].title.should.equal('');
                (typeof res[0].date).should.equal('object');
                res[0].ip.should.equal(helper.goodIp);
                res[0].userAgent.should.equal(helper.goodUserAgent);
                res[0].result.status.should.equal(1);
                res[0].result.succeeded.should.equal(2);
                res[0].result.failed.should.equal(0);
                done();
              })
              .catch(done);
          }
        });
      })
      .catch(done);
  });

  it('should succeed with at least one client failing', function(done) {
    var payload = {
      key: helper.config.get('privateAuth'),
      msg: 'xxx',
    };

    var options = {
      method: method,
      baseUrl: helper.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    var statusCode = 200;

    options.headers = {
      'User-Agent': helper.goodUserAgent,
      'X-Forwarded-For': helper.goodIp,
    };

    var data = _.cloneDeep(helper.goodClients);
    data[1].endpoint += 'x';
    data[2].endpoint += 'x';
    var goodP = helper.goodClients[0].endpoint.split('/').pop();

    nock(helper.gcmUrl)
      // the web-push-encryption module will try to call the actual endpoint url, so we just use nock to redirect any actual called url to our own fake url, which in return will respond again through nock
      .filteringPath(function(p) {
        var myP = p.split('/').pop();
        // filter the clients I want to succeed and the ones I want to
        if (myP === goodP) {
          return '/xxx';
        } else {
          return '/yyy';
        }
      })
      .post('/xxx')
      .reply(201)
      .post('/yyy')
      .times(2)
      .replyWithError({
        statusCode: 400,
        statusMessage: 'UnauthorizedRegistration',
      });

    Promise.map(data, function(item) {
      return collection.add(item).catch(done);
    })
      .then(function() {
        request(options, function(err, response) {
          if (err) {
            done(err);
          } else {
            var body = response.body;
            response.statusCode.should.equal(statusCode);
            body.status.should.equal(0);
            body.succeeded.should.equal(1);
            // body.failed.should.equal(2); // TODO

            helper.collectionMessages
              .find()
              .toArray()
              .then(function(res) {
                res.length.should.equal(1);
                res[0].msg.should.equal(payload.msg);
                res[0].title.should.equal('');
                (typeof res[0].date).should.equal('object');
                res[0].ip.should.equal(helper.goodIp);
                res[0].userAgent.should.equal(helper.goodUserAgent);
                res[0].result.status.should.equal(0);
                res[0].result.succeeded.should.equal(1);
                // res[0].result.failed.should.equal(2); // TODO
                done();
              })
              .catch(done);
          }
        });
      })
      .catch(done);
  });
});
