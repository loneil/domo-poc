const routes = require('express').Router();
const controller = require('./controller');

// Organize this mess of middelware files etc better
const { currentFileRecord, hasFilePermissions } = require('./middleware/filePermissions');
const fileUpload = require('./middleware/upload').fileUpload;
const { publicRateLimiter }= require('./middleware/rateLimiter');
const { currentUser } = require('./middleware/userAccess');

routes.use(currentUser);

// Add a file
routes.post('/', publicRateLimiter, fileUpload.upload, async (req, res, next) => {
  await controller.create(req, res, next);
});

// Get all my files listings (tied to oidc user making the call)
routes.get('/', async (req, res, next) => {
  await controller.fetchAll(req, res, next);
});

// Get a file
routes.get('/:id', currentFileRecord, hasFilePermissions('READ'), async (req, res, next) => {
  await controller.read(req, res, next);
});

// Delete a file
routes.delete('/:id', currentFileRecord, async (req, res, next) => {
  await controller.delete(req, res, next);
});

// Alter a file (IE write new version)
routes.post('/:id', publicRateLimiter, fileUpload.upload, hasFilePermissions('WRITE'), async (req, res, next) => {
  await controller.updateVersion(req, res, next);
});

// Toggle a file public or not
routes.patch('/:id/public', currentFileRecord, hasFilePermissions('MANAGE'), async (req, res, next) => {
  await controller.togglePublic(req, res, next);
});

// Get all the permissions on this file
routes.get('/:id/permissions', currentFileRecord, hasFilePermissions('MANAGE'), async (req, res, next) => {
  await controller.readPermissions(req, res, next);
});

// Grant access to a file to a specific user (specify permissions in body)
routes.post('/:id/permissions/:kcId', currentFileRecord, hasFilePermissions('MANAGE'), async (req, res, next) => {
  await controller.updatePermissions(req, res, next);
});

// Revoke permissions for a user
routes.delete('/:id/permissions/:kcId', currentFileRecord, hasFilePermissions('MANAGE'), async (req, res, next) => {
  await controller.deletePermissions(req, res, next);
});


module.exports = routes;

