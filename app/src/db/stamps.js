module.exports = (knex, table) => {
  table.string('createdBy').references('oidcId').inTable('oidc_user');
  table.timestamp('createdAt', {useTz: true}).defaultTo(knex.fn.now());
  table.string('updatedBy').references('oidcId').inTable('oidc_user');
  table.timestamp('updatedAt', {useTz: true}).defaultTo(knex.fn.now());
};
