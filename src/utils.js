module.exports.formatError = function(msg, err) {
  var obj = {
    status: 0,
    error: msg,
  };

  if (err) {
    obj.details = '';
    if (err.message) {
      obj.details = err.message;
    }
    if (err.statusCode || err.statusMessage) {
      obj.details = `${err.statusCode} ${err.statusMessage}`;
    }
  }

  return obj;
};

module.exports.formatOrigins = function(input) {
  var output = input;
  if (typeof output === 'string' && output !== '') {
    output = output.split(',');
  }
  if (Array.isArray(output)) {
    var newOutput = [];
    output.forEach(function(item) {
      if (typeof item === 'string' && item !== '') {
        newOutput.push(item.trim());
      }
    });
    return newOutput;
  }
  return [];
};
