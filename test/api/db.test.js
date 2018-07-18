/* global describe, it */
var sinon = require('sinon');
var helper = require('../helper');
var collection = helper.db.db.collection('test');

describe('MongoDB', function() {
  it('should log error event', function(done) {
    var spy = sinon.spy(console, 'log');

    helper.db.db.emit(
      'error',
      { name: 'errorName', message: 'errorMessage' },
      function() {
        spy.withArgs('error').calledOnce.should.equal(true);
      }
    );

    console.log.restore();
    done();
  });

  it('should log fake connected event', function(done) {
    var spy = sinon.spy(console, 'log');

    helper.db.db.emit('connected', function() {
      spy
        .withArgs('Connection established to MongoDB')
        .calledOnce.should.equal(true);
    });

    console.log.restore();
    done();
  });

  it('should log fake disconnected event', function(done) {
    var spy = sinon.spy(console, 'log');

    helper.db.db.emit('disconnected', function() {
      spy
        .withArgs('error', 'Lost MongoDB connection')
        .calledOnce.should.equal(true);
    });

    console.log.restore();
    done();
  });

  it('should log reconnected event', function(done) {
    var spy = sinon.spy(console, 'log');

    helper.db.db.emit('reconnected', function() {
      spy.withArgs('Reconnected to MongoDB').calledOnce.should.equal(true);
    });

    console.log.restore();
    done();
  });

  it('should log real disconnected and connected event', function(done) {
    var spy = sinon.spy(console, 'log');

    helper.db.db.close(function() {
      spy
        .withArgs('Error', 'Lost MongoDB connection')
        .calledOnce.should.equal(true);

      helper.db.reconnect(function() {
        spy
          .withArgs('Connection established to MongoDB')
          .calledOnce.should.equal(true);
        console.log.restore();
        done();
      });
    });
  });

  it('should log connect error', function(done) {
    var spy = sinon.spy(console, 'log');

    helper.db.connect(function() {
      spy.withArgs('Error').calledOnce.should.equal(true);
      done();
    });
  });
});

describe('MongoDB Driver functionalities using callbacks', function() {
  it('should insert document', function(done) {
    collection.insert({ a: 1 }, function(err, res) {
      if (err) {
        done(err);
      }
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0]._id.toString().should.not.equal('');
      res.ops[0].a.should.equal(1);
      done();
    });
  });

  it('should update document', function(done) {
    collection.insert({ a: 1 }, function(err, res) {
      if (err) {
        done(err);
      }
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      var id = res.ops[0]._id.toString();
      id.should.not.equal('');
      res.ops[0].a.should.equal(1);
      collection.update({ a: 1 }, { $set: { a: 4 } }, { multi: true }, function(
        err,
        res
      ) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.be.above(0);
        done();
      });
    });
  });

  it('should find a single document', function(done) {
    var id;
    collection.insert({ a: 1 }, function(err, res) {
      if (err) {
        done(err);
      }
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      id = res.ops[0]._id.toString();
      id.should.not.equal('');
      res.ops[0].a.should.equal(1);
      collection.findOne({ _id: helper.db.ObjectId(id) }, function(err, res) {
        var _id = res._id.toString();
        res.a.should.equal(1);
        _id.should.equal(id);
        done();
      });
    });
  });

  it('should find multiple documents', function(done) {
    collection.insert({ a: 111 }, function(err, res) {
      if (err) {
        done(err);
      }
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].a.should.equal(111);
      var id = res.ops[0]._id.toString();
      id.should.not.equal('');
      collection.insert({ a: 111 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].a.should.equal(111);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection
          .find({ a: 111 })
          .toArray()
          .then(function(res) {
            try {
              res.length.should.equal(2);
              done();
            } catch (err) {
              done(err);
            }
          })
          .catch(function(err) {
            done(err);
          });
      });
    });
  });

  it('should find all documents', function(done) {
    collection.insert({ b: 222 }, function(err, res) {
      if (err) {
        done(err);
      }
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].b.should.equal(222);
      var id = res.ops[0]._id.toString();
      id.should.not.equal('');
      collection.insert({ a: 111 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].a.should.equal(111);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection
          .find()
          .toArray()
          .then(function(res) {
            try {
              res.length.should.equal(2);
              done();
            } catch (err) {
              done(err);
            }
          })
          .catch(function(err) {
            done(err);
          });
      });
    });
  });

  it('should aggregate documents', function(done) {
    collection.insert({ b: 222 }, function(err, res) {
      if (err) {
        done(err);
      }
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].b.should.equal(222);
      var id = res.ops[0]._id.toString();
      id.should.not.equal('');
      collection.insert({ a: 111 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].a.should.equal(111);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection
          .aggregate()
          .toArray()
          .then(function(res) {
            try {
              res.length.should.equal(2);
              done();
            } catch (err) {
              done(err);
            }
          })
          .catch(function(err) {
            done(err);
          });
      });
    });
  });

  it('should remove document', function(done) {
    var id;
    collection.insert({ a: 1 }, function(err, res) {
      if (err) {
        done(err);
      }
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      id = res.ops[0]._id.toString();
      id.should.not.equal('');
      res.ops[0].a.should.equal(1);
      collection.remove({ _id: helper.db.ObjectId(id) }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        done();
      });
    });
  });
});

describe('MongoDB Driver functionalities using promises', function() {
  it('should insert document', function(done) {
    collection
      .insert({ a: 1 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]._id.toString().should.not.equal('');
        res.ops[0].a.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('should update document', function(done) {
    collection
      .insert({ a: 1 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        res.ops[0].a.should.equal(1);
        return collection.update({ a: 1 }, { $set: { a: 4 } }, { multi: true });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.be.above(0);
        done();
      })
      .catch(done);
  });

  it('should find a single document', function(done) {
    var id;
    collection
      .insert({ a: 1 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        id = res.ops[0]._id.toString();
        id.should.not.equal('');
        res.ops[0].a.should.equal(1);
        return collection.findOne({ _id: helper.db.ObjectId(id) });
      })
      .then(function(res) {
        var _id = res._id.toString();
        res.a.should.equal(1);
        _id.should.equal(id);
        done();
      })
      .catch(done);
  });

  it('should find multiple documents', function(done) {
    collection
      .insert({ a: 111 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].a.should.equal(111);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection.insert({ a: 111 });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].a.should.equal(111);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection.find({ a: 111 }).toArray();
      })
      .then(function(res) {
        res.length.should.equal(2);
        done();
      })
      .catch(done);
  });

  it('should find all documents', function(done) {
    collection
      .insert({ b: 222 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].b.should.equal(222);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection.insert({ a: 111 });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].a.should.equal(111);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection.find().toArray();
      })
      .then(function(res) {
        res.length.should.equal(2);
        done();
      })
      .catch(done);
  });

  it('should aggregate documents', function(done) {
    collection
      .insert({ b: 222 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].b.should.equal(222);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection.insert({ a: 111 });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].a.should.equal(111);
        var id = res.ops[0]._id.toString();
        id.should.not.equal('');
        return collection.aggregate().toArray();
      })
      .then(function(res) {
        res.length.should.equal(2);
        done();
      })
      .catch(done);
  });

  it('should remove document', function(done) {
    var id;
    collection
      .insert({ a: 1 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        id = res.ops[0]._id.toString();
        id.should.not.equal('');
        res.ops[0].a.should.equal(1);
        return collection.remove({ _id: helper.db.ObjectId(id) });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        done();
      })
      .catch(done);
  });
});
