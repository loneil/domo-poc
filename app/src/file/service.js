const { v4: uuidv4 } = require('uuid');

const { Files } = require('./models');
const storageService = require('./storage/storageService');


const service = {

  create: async (data, currentUser) => {
    let trx;
    try {
      trx = await Files.startTransaction();

      const obj = {};
      obj.id = uuidv4();
      obj.name = data.name;
      obj.mimeType = data.mimetype;
      obj.createdBy = currentUser.usernameIdp;

      const uploadResult = await storageService.upload(obj);
      obj.path = uploadResult.path;
      obj.storage = uploadResult.storage;

      await Files.query(trx).insert(obj);

      await trx.commit();
      const result = await service.read(obj.id);
      return result;
    } catch (err) {
      if (trx) await trx.rollback();
      throw err;
    }
  },

  read: async (id) => {
    return Files.query()
      .findById(id)
      .throwIfNotFound();
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
