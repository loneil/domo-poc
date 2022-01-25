const config = require('config');
const routes = require('./routes');

const fileUpload = require('./middleware/upload').fileUpload;

fileUpload.init({
  dir: config.has('files.uploads.dir') ? config.get('files.uploads.dir') : undefined,
  fieldName: config.has('files.uploads.fileKey') ? config.get('files.uploads.fileKey') : undefined,
  maxFileCount: config.has('files.uploads.fileCount') ? config.get('files.uploads.fileCount') : undefined,
  maxFileSize: config.has('files.uploads.fileMaxSize') ? config.get('files.uploads.fileMaxSize') : undefined
});


module.exports.mount = (app) => {
  const p = '/file';
  app.use(p, routes);
  return p;
};
