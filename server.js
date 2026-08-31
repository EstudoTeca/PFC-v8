const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO DE UPLOADS ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// --- CONEXÃO COM MONGODB ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Banco MongoDB Conectado com Sucesso!"))
    .catch(err => console.error("❌ Erro ao conectar no MongoDB:", err));

// Configuração para garantir que o _id também venha como id no frontend
const schemaOptions = { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
};

// --- MODELOS DO MONGODB ---
const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    perfil: { type: String, enum: ['ALUNO', 'PROFESSOR'], default: 'ALUNO' },
    ano: { type: String, default: 'Enem' }
}, schemaOptions);
const Usuario = mongoose.model('Usuario', UsuarioSchema);

const OpcaoSchema = new mongoose.Schema({ texto: { type: String, required: true } });

const AtividadeSchema = new mongoose.Schema({
    tipo: { type: String, enum: ['multipla', 'manual'], required: true },
    pergunta: { type: String, required: true },
    respostaCorreta: Number,
    opcoes: [OpcaoSchema]
});

const ElementoSchema = new mongoose.Schema({
    tipo: { type: String, enum: ['texto', 'video', 'imagem', 'pdf'], required: true },
    valor: { type: String, required: true },
    ordem: { type: Number, default: 0 }
});

const ConteudoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    materia: { type: String, required: true },
    anoEscolar: { type: String, required: true },
    isDestaque: { type: Boolean, default: false },
    temAtividade: { type: Boolean, default: false },
    dataEntrega: { type: Date }, // Para agendamento do professor
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    elementos: [ElementoSchema],
    atividades: [AtividadeSchema]
}, schemaOptions);
const Conteudo = mongoose.model('Conteudo', ConteudoSchema);

// NOVO: Modelo de Metas (Cronograma Pessoal do Aluno)
const MetaSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    texto: { type: String, required: true },
    data: { type: String, required: true }, 
    concluida: { type: Boolean, default: false },
    origem: { type: String, enum: ['manual', 'ia'], default: 'manual' }
}, schemaOptions);
const Meta = mongoose.model('Meta', MetaSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'EstudoTeca_Elite_2026';


// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/auth/registro', async (req, res) => {
    try {
        const { nome, email, senha, perfil, ano } = req.body;
        const hash = await bcrypt.hash(senha, 10);
        const user = await Usuario.create({ nome, email, senha: hash, perfil, ano });
        const token = jwt.sign({ id: user._id, perfil: user.perfil }, JWT_SECRET);
        res.json({ token, nome: user.nome, perfil: user.perfil, ano: user.ano, id: user._id });
    } catch (err) {
        res.status(400).json({ error: "E-mail já cadastrado ou dados inválidos." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const user = await Usuario.findOne({ email });
        if (!user || !(await bcrypt.compare(senha, user.senha))) {
            return res.status(401).json({ error: "E-mail ou senha incorretos." });
        }
        const token = jwt.sign({ id: user._id, perfil: user.perfil }, JWT_SECRET);
        res.json({ token, nome: user.nome, perfil: user.perfil, ano: user.ano, id: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROTAS DE UPLOAD & CONTEÚDO ---
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

app.post('/api/conteudos/completo', async (req, res) => {
    try {
        const { conteudo, elementos, atividades, professorId } = req.body;

        // No MongoDB, formatamos as opções para salvar junto com a atividade, num documento só!
        const atividadesFormatadas = atividades?.map(ativ => ({
            ...ativ,
            opcoes: ativ.opcoesLista ? ativ.opcoesLista.map(txt => ({ texto: txt })) : []
        })) || [];

        const novoConteudo = new Conteudo({
            ...conteudo,
            professorId,
            temAtividade: atividades && atividades.length > 0,
            elementos: elementos || [],
            atividades: atividadesFormatadas
        });

        await novoConteudo.save();
        res.json({ message: "Conteúdo criado com sucesso!", id: novoConteudo._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/conteudos/:materia/:ano', async (req, res) => {
    try {
        const { materia, ano } = req.params;
        const filtro = {};
        
        if (materia && materia !== 'all') filtro.materia = materia;
        if (ano && ano !== 'all') filtro.anoEscolar = ano;

        // Traz o conteúdo e já ordena pelo mais recente
        const lista = await Conteudo.find(filtro).sort({ createdAt: -1 });
        res.json(lista);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/conteudos/:id', async (req, res) => {
    try {
        const result = await Conteudo.findByIdAndDelete(req.params.id);
        res.json({ message: result ? "Conteúdo removido com sucesso!" : "Conteúdo não encontrado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- NOVAS ROTAS DO CRONOGRAMA ---
app.post('/api/cronograma', async (req, res) => {
    try {
        const novaMeta = await Meta.create(req.body);
        res.json(novaMeta);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/cronograma/:usuarioId', async (req, res) => {
    try {
        const metasAluno = await Meta.find({ usuarioId: req.params.usuarioId }).sort({ createdAt: -1 });
        // Busca conteúdos postados pelos professores que tem data de entrega
        const tarefasProfessores = await Conteudo.find({ dataEntrega: { $ne: null } }).sort({ dataEntrega: 1 });
        res.json({ metas: metasAluno, tarefasProfessor: tarefasProfessores });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/cronograma/:id', async (req, res) => {
    try {
        const meta = await Meta.findById(req.params.id);
        meta.concluida = !meta.concluida;
        await meta.save();
        res.json(meta);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/cronograma/:id', async (req, res) => {
    try {
        await Meta.findByIdAndDelete(req.params.id);
        res.json({ message: "Meta excluída." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ROTAS DE INTELIGÊNCIA ARTIFICIAL (GEMINI) ---

app.post('/api/ia/tutor', async (req, res) => {
    const { pergunta, contextoAno } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const prompt = `Você é o Tutor IA da EstudoTeca focado em alunos do Ensino Médio e ENEM. O aluno está na etapa: ${contextoAno || 'Geral'}. Responda com clareza, didática e passo a passo se for exercício:\n\nPergunta: ${pergunta}`;
        const result = await model.generateContent(prompt);
        res.json({ resposta: result.response.text() });
    } catch (err) {
        console.error("❌ ERRO NO TUTOR:", err.message || err);
        res.status(500).json({ error: "Erro ao comunicar com a IA do Tutor." });
    }
});

app.post('/api/ia/corrigir-redacao', async (req, res) => {
    const { texto, tema } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const prompt = `
            Você é um avaliador oficial da redação do ENEM. Avalie a redação sobre o tema: "${tema}".
            Retorne ESTRITAMENTE um objeto JSON válido, SEM NENHUM TEXTO ANTES OU DEPOIS.
            Exemplo de formato obrigatório:
            {"c1": 160, "c2": 160, "c3": 140, "c4": 160, "c5": 180, "total": 800, "feedback": "Análise..."}
            
            Redação do aluno:
            ${texto}
        `;
        const result = await model.generateContent(prompt);
        let respostaRaw = result.response.text();
        const limpo = respostaRaw.replace(/```json/gi, "").replace(/```/g, "").trim();
        res.json(JSON.parse(limpo));
    } catch (err) {
        console.error("❌ ERRO NA REDAÇÃO:", err.message || err);
        res.status(500).json({ error: "Erro ao processar correção da redação." });
    }
});

app.post('/api/ia/gerar-simulado', async (req, res) => {
    const { materia } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const prompt = `
            Gere 3 questões inéditas de múltipla escolha no estilo ENEM para a disciplina: "${materia}".
            Retorne ESTRITAMENTE um JSON Array válido, SEM NENHUM TEXTO ANTES OU DEPOIS.
            Exemplo de formato obrigatório:
            [
              {
                "pergunta": "Enunciado...",
                "opcoes": ["A", "B", "C", "D"],
                "correta": 0,
                "explicacao": "Explicação..."
              }
            ]
        `;
        const result = await model.generateContent(prompt);
        let respostaRaw = result.response.text();
        const limpo = respostaRaw.replace(/```json/gi, "").replace(/```/g, "").trim();
        res.json(JSON.parse(limpo));
    } catch (err) {
        console.error("❌ ERRO NO SIMULADO:", err.message || err);
        res.status(500).json({ error: "Erro ao gerar questões de simulado." });
    }
});

// AQUI ESTÁ A ROTA NOVA DO TEMA:
app.post('/api/ia/gerar-tema-redacao', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const prompt = `
            Aja como a banca do ENEM. Gere um tema atual, complexo e relevante para a redação do ENEM.
            Crie também de 2 a 3 textos motivadores (textos de apoio) curtos e informativos sobre esse tema.
            Retorne ESTRITAMENTE um objeto JSON válido, SEM NENHUM TEXTO ANTES OU DEPOIS.
            Exemplo de formato obrigatório:
            {
              "tema": "Título do tema gerado",
              "textosApoio": [
                "Texto motivador 1...",
                "Texto motivador 2..."
              ]
            }
        `;
        const result = await model.generateContent(prompt);
        let respostaRaw = result.response.text();
        const limpo = respostaRaw.replace(/```json/gi, "").replace(/```/g, "").trim();
        res.json(JSON.parse(limpo));
    } catch (err) {
        console.error("❌ ERRO NO GERADOR DE TEMA:", err.message || err);
        res.status(500).json({ error: "Erro ao gerar o tema de redação." });
    }
}); // <-- AQUI FECHA A ROTA DO TEMA

// NOVO: Gerador de Plano de Estudos IA
app.post('/api/ia/gerar-plano', async (req, res) => {
    const { horas, foco } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const prompt = `
            O aluno tem ${horas} horas disponíveis para estudar hoje, com foco em ${foco}.
            Gere 3 tarefas de estudo curtas e eficientes para o cronograma dele.
            Retorne ESTRITAMENTE um JSON Array válido, sem textos antes ou depois.
            Exemplo:
            [
              {"texto": "Revisar teoria de Biologia sobre Células (30 min)", "origem": "ia"},
              {"texto": "Fazer 10 exercícios de Química Orgânica (45 min)", "origem": "ia"}
            ]
        `;
        const result = await model.generateContent(prompt);
        let respostaRaw = result.response.text();
        const limpo = respostaRaw.replace(/```json/gi, "").replace(/```/g, "").trim();
        res.json(JSON.parse(limpo));
    } catch (err) {
        console.error("❌ ERRO NO PLANO IA:", err.message || err);
        res.status(500).json({ error: "Erro ao gerar plano de estudos." });
    }
}); // <-- AQUI FECHA A ROTA DO PLANO

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor EstudoTeca (MongoDB) rodando na porta ${PORT}`));