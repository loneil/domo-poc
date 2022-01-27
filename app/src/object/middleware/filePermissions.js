const Problem = require('api-problem');

const log = require('../../components/log')(module.filename);
const service = require('../service');

/**
 * @function currentFileRecord
 * Get the DB record for this file being accessed and store in request for use further down the chain
 * @returns {Function} a middleware function
 */
const currentFileRecord = async (req, res, next) => {
  let fileRecord = undefined;
  try {
    // Check if authed, can expand for API key access if needed
    if (req.params.id) {
      fileRecord = await service.read(req.params.id);
    }
  } catch (error) {
    log.error(`Failed to find file record for id ${req.params.id}. Error ${error}`);
  }

  if (!fileRecord) {
    // 403 on no auth or file not found (don't 404 for id discovery)
    return next(new Problem(403, { detail: 'File access to this ID is unauthorized.' }));
  }

  req.currentFileRecord = fileRecord;
  next();
};

/**
 * @function hasFilePermissions
 * Check if the call can be made
 * @returns {Function} a middleware function
 */
const hasFilePermissions = (permission) => {
  return async (req, res, next) => {
    // If asking to read a public file you're good
    if (req.currentFileRecord.public && permission === 'READ') {
      return next();
    }

    // Other than the above case, gaurd against unauthed access for anything
    if (!req.currentUser || !req.currentUser.keycloakId) {
      return next(new Problem(403, { detail: 'Unauthorized for this file' }));
    }

    // Permute permissions and check if the permission to check exists for the user making the call
    const permissions = await service.readPermissions(req.params.id, req.currentUser.keycloakId);
    if (!permissions.length) {
      return next(new Problem(403, { detail: 'Unauthorized for this file' }));
    }



    next();
  };
};


module.exports = {
  currentFileRecord, hasFilePermissions
};
