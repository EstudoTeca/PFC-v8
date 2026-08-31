import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ChatIA.css';

function ChatTutor() {
    const [mensagens, setMensagens] = useState([
        { texto: "Olá! Sou seu Tutor IA. Em que posso te ajudar hoje?", tipo: 'tutor' }
    ]);
    const [input, setInput] = useState('');
    const [carregando, setCarregando] = useState(false);

    const enviarPergunta = async () => {
        if (!input.trim()) return;

        const novaMensagem = { texto: input, tipo: 'aluno' };
        setMensagens([...mensagens, novaMensagem]);
        setInput('');
        setCarregando(true);

        try {
            const res = await axios.post('http://localhost:5000/api/ia/tutor', {
                pergunta: input,
                contextoAno: localStorage.getItem('ano') // 1ano, 2ano, etc
            });

            setMensagens(prev => [...prev, { texto: res.data.resposta, tipo: 'tutor' }]);
        } catch (err) {
            setMensagens(prev => [...prev, { texto: "Ops, tive um erro técnico. Tente de novo!", tipo: 'tutor' }]);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <span>🤖 Tutor EstudoTeca</span>
            </div>
            
            <div className="chat-messages">
                {mensagens.map((m, index) => (
                    <div key={index} className={`msg msg-${m.tipo}`}>
                        {m.texto}
                    </div>
                ))}
                {carregando && <p style={{fontSize: '12px'}}>Tutor está pensando...</p>}
            </div>

            <div className="chat-input-area">
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && enviarPergunta()}
                    placeholder="Tire sua dúvida..."
                />
                <button className="btn-enviar" onClick={enviarPergunta}>➡</button>
            </div>
        </div>
    );
}

export default ChatTutor;