const mongoose = require('mongoose');
require('dotenv').config();

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Atlas Conectado com Sucesso!");
    } catch (err) {
        console.error("❌ Erro ao conectar ao MongoDB:", err.message);
        process.exit(1);
    }
};

module.exports = conectarDB;