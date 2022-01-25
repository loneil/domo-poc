const { v4: uuidv4 } = require('uuid');

const { Files, FilePermissions } = require('./models');
const storageService = require('./storage/storageService');


const service = {

  create: async (file, body, currentUser) => {
    let trx;
    try {
      trx = await Files.startTransaction();

      const obj = {};
      obj.id = uuidv4();
      obj.originalName = file.originalname;
      obj.mimeType = file.mimetype;
      obj.createdBy = currentUser.username;
      obj.public = body.public === 'true'; // sort this out
      obj.path = file.path;
      if (currentUser.keycloakId) {
        obj.uploaderOidcId = currentUser.keycloakId;
      }

      // Add File to storage
      const uploadResult = await storageService.upload(obj);
      obj.path = uploadResult.path;
      obj.storage = uploadResult.storage;

      // Add file record to DB
      await Files.query(trx).insert(obj);

      // Add permissions for the uploader
      if (currentUser.keycloakId && currentUser.username != 'public') {

        const fp = {};
        fp.oidcId = currentUser.keycloakId;
        fp.fileId = obj.id;
        fp.createdBy = currentUser.username;

        // TODO: Simplify?
        fp.id = uuidv4();
        fp.code = 'READ';
        await FilePermissions.query(trx).insert(fp);
        fp.id = uuidv4();
        fp.code = 'WRITE';
        await FilePermissions.query(trx).insert(fp);
        fp.id = uuidv4();
        fp.code = 'MANAGE';
        await FilePermissions.query(trx).insert(fp);
      }

      await trx.commit();
      const result = await service.read(obj.id);
      return result;
    } catch (err) {
      if (trx) await trx.rollback();
      throw err;
    }
  },

  updateVersion: async (id, file, currentUser) => {
    let trx;
    try {
      trx = await Files.startTransaction();

      // Update file record
      // TODO: how to track versions in DB model
      const updatedRecord = await Files.query()
        .patchAndFetchById(id, {
          mimeType: file.mimetype,
          updatedBy: currentUser.username
        });

      // TODO: Implement
      // Add new version
      throw new Error('Not Implemented');
      // const uploadResult = await storageService.upload(obj);
      // obj.path = uploadResult.path;

      // eslint-disable-next-line no-unreachable
      await trx.commit();
      return updatedRecord;
    } catch (err) {
      if (trx) await trx.rollback();
      throw err;
    }
  },

  share: async (request) => {
    let trx;
    try {
      trx = await Files.startTransaction();
      // Add permissions
      if (request.params.kcId) {

        const fp = {};
        fp.oidcId = request.params.kcId;
        fp.fileId = request.params.id;
        fp.createdBy = request.currentUser.username;

        // TODO: Simplify (use FKs etc rather than constants here)
        fp.id = uuidv4();
        fp.code = 'READ';
        await FilePermissions.query(trx).insert(fp);
      }

      await trx.commit();
      const result = await service.read(request.params.id);
      return result;
    } catch (err) {
      if (trx) await trx.rollback();
      throw err;
    }
  },

  fetchAll: async (currentUser) => {
    return Files.query()
      .allowGraph('[filePermissions]')
      .withGraphFetched('filePermissions')
      .modifyGraph('filePermissions', builder => builder.where('oidcId', currentUser.keycloakId));
  },

  read: async (id) => {
    return Files.query()
      .findById(id)
      .throwIfNotFound();
  },

  readPermissions: async (fileId, oidcId) => {
    return FilePermissions.query()
      .where('fileId', fileId)
      .where('oidcId', oidcId);
  },

  delete: async (id) => {
    let trx;
    try {
      trx = await Files.startTransaction();
      const obj = await service.read(id);

      await Files.query(trx)
        .deleteById(id)
        .throwIfNotFound();

      const result = await storageService.delete(obj);
      if (!result) {
        // error?
      }
      await trx.commit();
      return result;
    } catch (err) {
      if (trx) await trx.rollback();
      throw err;
    }
  },

};

module.exports = service;
