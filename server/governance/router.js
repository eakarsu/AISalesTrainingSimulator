const express = require('express');
const sequelize = require('../config/database');
const auth = require('../middleware/auth');
const { createWorkflow } = require('./workflowCore');
const { createGovernedRouter } = require('./routerFactory');

const run = async (sql, params, transaction) => {
  const [rows] = await sequelize.query(sql, { bind: params, transaction });
  return rows;
};
const db = {
  query: (sql, params) => run(sql, params),
  transaction: (work) => sequelize.transaction(
    async (transaction) => work((sql, params) => run(sql, params, transaction))
  ),
};

module.exports = createGovernedRouter({
  express,
  workflow: createWorkflow(require('./config')),
  auth,
  db,
});
