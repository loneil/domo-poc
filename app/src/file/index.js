const routes = require('./routes');

module.exports.mount = (app) => {
  const p = '/file';
  app.use(p, routes);
  return p;
};
