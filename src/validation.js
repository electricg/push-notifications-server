var joi = require('joi');
var config = require('./config');

var regex = {
  auth: new RegExp(/^[a-zA-Z0-9_=-]+$/),
  p256dh: new RegExp(/^[a-zA-Z0-9_=-]+$/),
  authHeader: new RegExp('^' + config.get('authHeader'))
};
var max = {
  msg: 120,
  title: 50
};

var customJoi = joi.extend({
  base: joi.string(),
  name: 'auth',
  language: {
    scheme: 'needs to start with "' + config.get('authHeader') + '"',
    params: 'has the parameter {{q}} not valid'
  },
  rules: [{
    name: 'scheme',
    validate: function(params, value, state, options) {
      value = value.trim();
      if (value.indexOf(config.get('authHeader')) !== 0) {
        return this.createError('auth.scheme', { v: value }, state, options);
      }
      return value.replace(config.get('authHeader'), '');
    }
  }, {
    name: 'params',
    validate: function(params, value, state, options) {
      var arr = value.split(',');
      var obj = {};
      arr.forEach(function(item) {
        var sep = item.indexOf('=');
        var p = item.substring(0, sep).trim();
        var v = item.substring(sep + 1).trim();
        obj[p] = v;
      });

      var res = {};
      var tmp;
      var par = Object.keys(singleValidates.subscription);
      for (var i = 0; i < par.length; i++) {
        tmp = joi.validate(obj[par[i]], singleValidates.subscription[par[i]]);
        if (tmp.error) {
          return this.createError('auth.params', { v: value, q: par[i] }, state, options);
        }
        res[par[i]] = tmp.value;
      }
      return res;
    }
  }]
});

var authHeader = customJoi.auth().scheme().params().required();

var singleValidates = {
  subscription: {
    endpoint: joi.string().strict().uri({ scheme: 'https' }).required(),
    expirationTime: joi.any().optional(),
    auth: joi.string().strict().regex(regex.auth).required(),
    p256dh: joi.string().strict().regex(regex.p256dh).required()
  },
  clientId: joi.string().strict().lowercase().length(24).hex().required(),
  push: {
    key: joi.string().strict().required(),
    msg: joi.string().strict().max(max.msg).required(),
    title: joi.string().strict().max(max.title).default('').optional()
  },
  headers: joi.object({
    'authorization': authHeader
  }).options({ allowUnknown: true })
};

module.exports = singleValidates;