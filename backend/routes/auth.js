const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SECRET = "ChaveMestraEstudoTeca"; // Em produção, use variáveis de ambiente

// ROTA DE CADASTRO
router.post('/registro', async (req, res) => {
    try {
        const { nome, email, senha, perfil, ano } = req.body;
        
        // Escondendo a senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoUsuario = new Usuario({ nome, email, senha: senhaHash, perfil, ano });
        await novoUsuario.save();

        res.status(201).json({ message: "Usuário criado!" });
    } catch (err) {
        res.status(400).json({ error: "Email já cadastrado ou erro nos dados." });
    }
});

// ROTA DE LOGIN
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email });

    if (!usuario) return res.status(400).json({ error: "Usuário não encontrado" });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(400).json({ error: "Senha incorreta" });

    // Gerando o Token com o Perfil embutido
    const token = jwt.sign({ id: usuario._id, perfil: usuario.perfil }, SECRET);
    
    res.json({ token, perfil: usuario.perfil, nome: usuario.nome });
});

module.exports = router;