const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('estudoteca', 'root', 'SUA_SENHA_AQUI', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false // Para não encher o terminal de textos chatos
});

module.exports = sequelize;