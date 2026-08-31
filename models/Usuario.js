const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Usuario = sequelize.define('Usuario', {
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },
    perfil: { type: DataTypes.ENUM('ALUNO', 'PROFESSOR'), defaultValue: 'ALUNO' },
    ano: { type: DataTypes.STRING, defaultValue: 'Enem' }
});

module.exports = Usuario;