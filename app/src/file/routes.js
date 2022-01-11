const routes = require('express').Router();
const controller = require('./controller');

// Organize these middelware files etc better
const { currentFileRecord } = require('./middleware/filePermissions');
const fileUpload = require('./middleware/upload').fileUpload;
const { publicRateLimiter }= require('./middleware/rateLimiter');
const { currentUser } = require('./middleware/userAccess');

routes.use(currentUser);

routes.post('/', publicRateLimiter, fileUpload.upload, async (req, res, next) => {
  await controller.create(req, res, next);
});

routes.get('/:id', currentFileRecord, async (req, res, next) => {
  await controller.read(req, res, next);
});

routes.delete('/:id', currentFileRecord, async (req, res, next) => {
  await controller.delete(req, res, next);
});

module.exports = routes;
