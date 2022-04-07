module.exports = (sequelize, Sequelize) => {
  const Contracts = sequelize.define(
    'contracts',
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      profit: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amountPerWithdrawal: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      sponsorshipBenefits: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      firstLevelBenefits: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      secondLevelBenefits: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      thirdLevelBenefits: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    },
  );
  return Contracts;
};
