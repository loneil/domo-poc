const stamps = require('../stamps');

const CREATED_BY = 'migration-000';

exports.up = function(knex) {
  return Promise.resolve()

    // Create tables
    .then(() => knex.schema.createTable('permissions', table => {
      table.string('code').primary();
      table.string('display').notNullable();
      table.boolean('active').notNullable().defaultTo(true);
      stamps(knex, table);
    }))
    .then(() => knex.schema.createTable('files', table => {
      table.uuid('id').primary();
      table.string('originalName', 1024).notNullable();
      table.string('path', 1024).notNullable();
      table.string('mimeType').notNullable();
      table.string('storage').notNullable();
      table.string('uploaderOidcId');
      table.boolean('public').notNullable().defaultTo(false);
      stamps(knex, table);
    }))
    .then(() => knex.schema.createTable('file_permissions', table => {
      table.uuid('id').primary();
      table.string('oidcId').notNullable();
      table.uuid('fileId').references('id').inTable('files').notNullable();
      table.string('code').references('code').inTable('permissions').notNullable();
      table.boolean('active').notNullable().defaultTo(true);
      stamps(knex, table);
    }))

    // Populate Data
    .then(() => {
      const items = [
        {
          createdBy: CREATED_BY,
          code: 'READ',
          display: 'Read',
          active: true
        },
        {
          createdBy: CREATED_BY,
          code: 'WRITE',
          display: 'Write',
          active: true
        },
        {
          createdBy: CREATED_BY,
          code: 'MANAGE',
          display: 'Manage',
          active: true
        },
      ];
      return knex('permissions').insert(items);
    });
};

exports.down = function(knex) {
  return Promise.resolve()
    .then(() => knex.schema.dropTableIfExists('file_permissions'))
    .then(() => knex.schema.dropTableIfExists('files'))
    .then(() => knex.schema.dropTableIfExists('permissions'));
};
