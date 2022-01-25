const { Model } = require('objection');
const { Timestamps } = require('../mixins');
// const { Regex } = require('../../constants');
const stamps = require('../jsonSchema').stamps;

class FilePermissions extends Timestamps(Model) {
  static get tableName() {
    return 'file_permissions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'oidcId', 'fileId', 'code'],
      properties: {
        // id: { type: 'string', pattern: Regex.UUID },
        id: { type: 'string' },
        oidcId: { type: 'string' },
        fileId: { type: 'string' },
        code: { type: 'string' },
        ...stamps
      },
      additionalProperties: false
    };
  }
}

module.exports = FilePermissions;
