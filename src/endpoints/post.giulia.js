module.exports.handler = function(request, reply) {
  const { payload, headers } = request;

  console.log({
    payload: JSON.stringify(payload),
    headers: JSON.stringify(headers),
  });

  reply({ status: 1, payload, headers });
};
