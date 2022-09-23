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
  // var params = {
  //   payload: message,
  //   userPublicKey: subscription.keys.p256dh,
  //   userAuth: subscription.keys.auth,
  // };
  var pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };
  var payload = message;
  var options = {};
  return webpush.sendNotification(pushSubscription, payload, options);
};

// Send push with welcome message when subscribtion data arrives
module.exports.checkSubscribtion = function(subscription) {
  return sendPush(subscription, config.get('welcomeMsg'));
};

// Send push with message to all the subscriptions.
// The calls are indipendent from each other, we just want to know how many succeeded and how many failed, altough these numbers are not completely accurate
module.exports.sendPushes = (subscriptions, msg, title) => {
  let e = 0;
  let r = 0;
  let d = [];

  const promises = subscriptions.map(subscription => {
    return new Promise((resolve, reject) => {
      sendPush(subscription, msg, title)
        .then(res => {
          r++;
          resolve(res);
        })
        .catch(err => {
          e++;
          //TODO is this the correct check?
          // if (err.statusCode === 400) {
          d.push(subscription);
          // }
          reject(err);
        });
    });
  });

  return Promise.all(promises)
    .then(() => {
      return { e: e, r: r, d: d };
    })
    .catch(() => {
      return Promise.reject({ e: e, r: r, d: d });
    });
};
