const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes, Op } = require('sequelize');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO DE UPLOADS (Imagens e PDFs) ---
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir); }

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

// --- BANCO DE DADOS (MySQL) ---
const sequelize = new Sequelize('estudoteca', 'root', process.env.DB_PASSWORD || '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'EstudoTeca_Elite_2026';

// --- DEFINIÇÃO DOS MODELOS ---

const Usuario = sequelize.define('Usuario', {
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },
    perfil: { type: DataTypes.ENUM('ALUNO', 'PROFESSOR'), defaultValue: 'ALUNO' },
    ano: { type: DataTypes.STRING, defaultValue: 'Enem' }
});

const Conteudo = sequelize.define('Conteudo', {
    titulo: { type: DataTypes.STRING, allowNull: false },
    materia: { type: DataTypes.STRING, allowNull: false },
    anoEscolar: { type: DataTypes.STRING, allowNull: false },
    isDestaque: { type: DataTypes.BOOLEAN, defaultValue: false },
    temAtividade: { type: DataTypes.BOOLEAN, defaultValue: false },
    professorId: DataTypes.INTEGER
});

const ElementoConteudo = sequelize.define('ElementoConteudo', {
    tipo: { type: DataTypes.ENUM('texto', 'video', 'imagem', 'pdf'), allowNull: false },
    valor: { type: DataTypes.TEXT, allowNull: false }, // Texto, Link YT ou Caminho do Arquivo
    ordem: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Atividade = sequelize.define('Atividade', {
    tipo: { type: DataTypes.ENUM('multipla', 'manual'), allowNull: false },
    pergunta: { type: DataTypes.TEXT, allowNull: false },
    midiaUrl: DataTypes.STRING, 
    respostaCorreta: DataTypes.INTEGER 
});

const Opcao = sequelize.define('Opcao', {
    texto: { type: DataTypes.STRING, allowNull: false }
});

// --- RELACIONAMENTOS COM CASCADE TOTAL ---
// Ao deletar Conteudo -> Deleta Elementos e Atividades
Conteudo.hasMany(ElementoConteudo, { as: 'elementos', foreignKey: 'conteudoId', onDelete: 'CASCADE', hooks: true });
ElementoConteudo.belongsTo(Conteudo, { foreignKey: 'conteudoId' });

Conteudo.hasMany(Atividade, { as: 'atividades', foreignKey: 'conteudoId', onDelete: 'CASCADE', hooks: true });
Atividade.belongsTo(Conteudo, { foreignKey: 'conteudoId' });

// Ao deletar Atividade -> Deleta Opções
Atividade.hasMany(Opcao, { as: 'opcoes', foreignKey: 'atividadeId', onDelete: 'CASCADE', hooks: true });
Opcao.belongsTo(Atividade, { foreignKey: 'atividadeId' });

// Sincronização
sequelize.sync({ alter: true }).then(() => console.log("✅ Banco MySQL V2 Sincronizado"));

// --- ROTAS ---

// 1. Upload de Arquivos (Imagens/PDFs)
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('Erro no upload.');
    res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

// 2. Criar Conteúdo com Blocos e Questões
app.post('/api/conteudos/completo', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { conteudo, elementos, atividades, professorId } = req.body;

        const novoConteudo = await Conteudo.create({
            ...conteudo,
            professorId,
            temAtividade: atividades && atividades.length > 0
        }, { transaction: t });

        if (elementos && elementos.length > 0) {
            const elSalvar = elementos.map((el, i) => ({ ...el, ordem: i, conteudoId: novoConteudo.id }));
            await ElementoConteudo.bulkCreate(elSalvar, { transaction: t });
        }

        if (atividades && atividades.length > 0) {
            for (let ativ of atividades) {
                const novaAtiv = await Atividade.create({ ...ativ, conteudoId: novoConteudo.id }, { transaction: t });
                if (ativ.tipo === 'multipla' && ativ.opcoesLista) {
                    const ops = ativ.opcoesLista.map(txt => ({ texto: txt, atividadeId: novaAtiv.id }));
                    await Opcao.bulkCreate(ops, { transaction: t });
                }
            }
        }

        await t.commit();
        res.json({ message: "Sucesso!" });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
});

// 3. Buscar Conteúdos (Inclusão Total)
app.get('/api/conteudos/:materia/:ano', async (req, res) => {
    try {
        const { materia, ano } = req.params;
        const filtro = (materia === 'all' && ano === 'all') ? {} : { materia, anoEscolar: ano };
        
        const lista = await Conteudo.findAll({ 
            where: filtro,
            include: [
                { model: ElementoConteudo, as: 'elementos' },
                { model: Atividade, as: 'atividades', include: [{ model: Opcao, as: 'opcoes' }] }
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: ElementoConteudo, as: 'elementos' }, 'ordem', 'ASC']
            ]
        });
        res.json(lista);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Excluir Conteúdo (Cascade automático)
app.delete('/api/conteudos/:id', async (req, res) => {
    try {
        const result = await Conteudo.destroy({ where: { id: req.params.id } });
        res.json({ message: result ? "Removido!" : "Não encontrado." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Autenticação
app.post('/api/auth/registro', async (req, res) => {
    try {
        const { nome, email, senha, perfil, ano } = req.body;
        const hash = await bcrypt.hash(senha, 10);
        const user = await Usuario.create({ nome, email, senha: hash, perfil, ano });
        const token = jwt.sign({ id: user.id, perfil: user.perfil }, JWT_SECRET);
        res.json({ token, nome: user.nome, perfil: user.perfil, ano: user.ano, id: user.id });
    } catch (err) { res.status(400).json({ error: "E-mail duplicado." }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;
    const user = await Usuario.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(senha, user.senha))) return res.status(401).json({ error: "Erro" });
    const token = jwt.sign({ id: user.id, perfil: user.perfil }, JWT_SECRET);
    res.json({ token, nome: user.nome, perfil: user.perfil, ano: user.ano, id: user.id });
});

// IA Tutor
app.post('/api/ia/tutor', async (req, res) => {
    const { pergunta, contextoAno } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`Tutor EstudoTeca (${contextoAno}): ${pergunta}`);
        res.json({ resposta: result.response.text() });
    } catch (err) { res.status(500).send("Erro IA"); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 EstudoTeca Server rodando na porta ${PORT}`));