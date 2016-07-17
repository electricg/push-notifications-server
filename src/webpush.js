var Promise = require('bluebird');
var webpush = require('web-push-encryption');
var config = require('./config');


webpush.setGCMAPIKey(config.gcmAuth);

// Send push with message to a single subscription.
// Try and catch is for when subscription is invalid
// (the webpush library throws errors in that case)
var sendPush = function(subscription, msg, title) {
  var message = { b: msg };
  if (title) {
    message.t = title;
  }
  message = JSON.stringify(message);
  try {
    return webpush.sendWebPush(message, subscription);
  } catch(e) {
    return Promise.reject(e);
  }
};

// Send push with welcome message when subscribtion data arrives
module.exports.checkSubscribtion = function(subscription) {
  return sendPush(subscription, config.welcomeMsg);
};

// Send push with message to all the subscriptions.
// The calls are indipendent from each other, we just want to know how many succeeded and how many failed
module.exports.sendPushes = function(subscriptions, msg, title) {
  var e = 0;
  var r = 0;
  return Promise.map(subscriptions, function(subscription) {
    return sendPush(subscription, msg, title)
    .then(function(res) {
      r++;
      return res;
    })
    .catch(function(err) {
      e++;
      return Promise.reject(err);
    });
  })
  .then(function() {
    return { e: e, r: r };
  })
  .catch(function() {
    return Promise.reject({ e: e, r: r });
  });
};