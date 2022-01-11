const { Model } = require('objection');
const { Timestamps } = require('../mixins');
// const { Regex } = require('../../constants');
const stamps = require('../jsonSchema').stamps;

class Files extends Timestamps(Model) {
  static get tableName() {
    return 'files';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'name', 'path', 'mimeType', 'uploaderOidcId'],
      properties: {
        // id: { type: 'string', pattern: Regex.UUID },
        id: { type: 'string', pattern: Regex.UUID },
        name: { type: 'string', minLength: 1, maxLength: 1024 },
        path: { type: 'string', minLength: 1, maxLength: 1024 },
        mimeType: { type: 'string' },
        uploaderOidcId: { type: 'string' },
        ...stamps
      },
      additionalProperties: false
    };
  }
}

module.exports = Files;
