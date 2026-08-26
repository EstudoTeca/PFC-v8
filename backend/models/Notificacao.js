const mongoose = require('mongoose');

const NotificacaoSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // Quem recebe
    mensagem: String,
    tipo: String, // 'atividade', 'aula', 'sistema'
    lida: { type: Boolean, default: false },
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notificacao', NotificacaoSchema);