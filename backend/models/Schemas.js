const mongoose = require('mongoose');

// 1. USUÁRIOS
const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    perfil: { type: String, enum: ['ALUNO', 'PROFESSOR'], required: true },
    ano: { type: String, default: 'Enem' }
});

// 2. CONTEÚDO (Aulas e Atividades)
const ConteudoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    tipo: { type: String, enum: ['video', 'atividade'], required: true },
    materia: String,
    anoEscolar: String,
    urlMidia: String,
    descricao: String,
    dataEntrega: Date,
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});

// 3. REDAÇÕES (Para histórico e avaliação da IA)
const RedacaoSchema = new mongoose.Schema({
    alunoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    texto: String,
    tema: String,
    notaFinal: Number,
    feedbackIA: String,
    data: { type: Date, default: Date.now }
});

module.exports = {
    Usuario: mongoose.model('Usuario', UsuarioSchema),
    Conteudo: mongoose.model('Conteudo', ConteudoSchema),
    Redacao: mongoose.model('Redacao', RedacaoSchema)
};