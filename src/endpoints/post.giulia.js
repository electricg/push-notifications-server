module.exports.handler = function(request, reply) {
  const { payload, headers } = request;

  console.log({ payload, headers });

  reply({ status: 1, payload, headers });
};
