const dbConnection = require('../config/connection');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  dbConnection.DB,
  dbConnection.USER,
  dbConnection.PASSWORD,
  {
    host: dbConnection.HOST,
    dialect: dbConnection.dialect,
    operatorsAliases: false,
    pool: {
      max: dbConnection.pool.max,
      min: dbConnection.pool.min,
      acquire: dbConnection.pool.acquire,
      idle: dbConnection.pool.idle,
    },
  },
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.accounts = require('./accounts')(sequelize, Sequelize);
db.contracts = require('./contracts')(sequelize, Sequelize);

db.contracts.hasMany(db.accounts, {
  foreignKey: 'idContract',
  as: 'hasAccount',
});
db.accounts.belongsTo(db.contracts, {
  foreignKey: 'idContract',
  as: 'contract',
});

module.exports = db;
