const config = require('./config');

const list = [
  { method: 'GET', path: '/info', module: 'get.info' },
  { method: 'GET', path: '/clients', module: 'get.clients' },
  { method: 'POST', path: '/clients', module: 'post.clients' },
  { method: 'DELETE', path: '/client/{id}', module: 'delete.client' },
  {
    method: 'GET',
    path: `/${config.get('privatePath')}`,
    module: 'get.special',
  },
  {
    method: 'POST',
    path: `/${config.get('privatePath')}`,
    module: 'post.special',
  },
  { method: 'POST', path: '/giulia', module: 'post.giulia' },
];

const routes = list.map(route => {
  const { method, path, module } = route;
  const mod = require(`./endpoints/${module}`);
  const { handler, validate } = mod;
  const options = {
    method,
    path,
    handler,
  };

  if (validate) {
    options.config.validate = validate;
  }

  return options;
});

module.exports = routes;
