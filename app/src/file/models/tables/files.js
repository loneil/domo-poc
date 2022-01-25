const { Model } = require('objection');
const { Timestamps } = require('../mixins');
// const { Regex } = require('../../constants');
const stamps = require('../jsonSchema').stamps;

class Files extends Timestamps(Model) {
  static get tableName() {
    return 'files';
  }

  static get relationMappings() {
    const FilePermissions = require('./filePermissions');

    return {
      filePermissions: {
        relation: Model.HasManyRelation,
        modelClass: FilePermissions,
        join: {
          from: 'files.id',
          to: 'file_permissions.fileId'
        }
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'originalName', 'path', 'mimeType'],
      properties: {
        // id: { type: 'string', pattern: Regex.UUID },
        id: { type: 'string' },
        originalName: { type: 'string', minLength: 1, maxLength: 1024 },
        path: { type: 'string', minLength: 1, maxLength: 1024 },
        mimeType: { type: 'string' },
        storage: { type: 'string' },
        uploaderOidcId: { type: 'string' },
        public: { type: 'boolean' },
        ...stamps
      },
      additionalProperties: false
    };
  }
}

module.exports = Files;
