const mongoose = require('mongoose');

module.exports = mongoose.model('Conteudo', ConteudoSchema);

const ConteudoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: String,
    tipo: { type: String, enum: ['video', 'atividade'], required: true },
    materia: String, 
    anoEscolar: { type: String, enum: ['1ano', '2ano', '3ano', 'Enem'], required: true },
    urlMidia: String, // Link do YouTube ou PDF
    dataEntrega: { type: Date }, // Para o cronograma
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    dataCriacao: { type: Date, default: Date.now }
});