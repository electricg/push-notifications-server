/* global before */
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var mockgoose = require('mockgoose');
var server;

module.exports.config = require('../config');

before(function(done) {
  mockgoose(mongoose)
  .then(function() {
    mongoose.connect('mongodb://localhost:27017/clients', function(err) {
      server = require('../server');
      done(err);
    });
  });
});