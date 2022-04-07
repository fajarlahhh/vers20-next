module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: 'vers20',
  dialect: 'mysql',
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
