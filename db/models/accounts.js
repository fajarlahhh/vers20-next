module.exports = (sequelize, Sequelize) => {
  const Accounts = sequelize.define(
    'accounts',
    {
      uuid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      idContract: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: 'contracts',
        referencesKey: 'id',
      },
      idParent: {
        type: Sequelize.BIGINT,
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      emailVerification: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    },
  );
  return Accounts;
};
