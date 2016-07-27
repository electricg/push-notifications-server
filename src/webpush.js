var Promise = require('bluebird');
var webpush = require('web-push');
var config = require('./config');


webpush.setGCMAPIKey(config.get('gcmAuth'));

// Send push with message to a single subscription.
// Try and catch is for when subscription is invalid
// (the webpush library throws errors in that case)
var sendPush = function(subscription, msg, title) {
  var message = { b: msg };
  if (title) {
    message.t = title;
  }
  message = JSON.stringify(message);
  var params = {
    payload: message,
    userPublicKey: subscription.keys.p256dh,
    userAuth: subscription.keys.auth
  };
  return webpush.sendNotification(subscription.endpoint, params);
};

// Send push with welcome message when subscribtion data arrives
module.exports.checkSubscribtion = function(subscription) {
  return sendPush(subscription, config.get('welcomeMsg'));
};

// Send push with message to all the subscriptions.
// The calls are indipendent from each other, we just want to know how many succeeded and how many failed, altough these numbers are not completely accurate
module.exports.sendPushes = function(subscriptions, msg, title) {
  var e = 0;
  var r = 0;
  var d = [];
  return Promise.map(subscriptions, function(subscription) {
    return sendPush(subscription, msg, title)
    .then(function(res) {
      r++;
      return res;
    })
    .catch(function(err) {
      e++;
      //TODO is this the correct check?
      // if (err.statusCode === 400) {
      d.push(subscription);
      // }
      return Promise.reject(err);
    });
  })
  .then(function() {
    return { e: e, r: r, d: d };
  })
  .catch(function() {
    return Promise.reject({ e: e, r: r, d: d });
  });
};