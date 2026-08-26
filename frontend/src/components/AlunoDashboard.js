import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Aluno.css';

function AlunoDashboard() {
    const [materiais, setMateriais] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pegamos os dados que salvamos no Login
    const nomeAluno = localStorage.getItem('nome');
    const anoAluno = localStorage.getItem('ano') || 'Enem'; // Padrão Enem se não achar

    useEffect(() => {
        const fetchMateriais = async () => {
            try {
                // Rota filtrada que criamos no backend
                const res = await axios.get(`http://localhost:5000/api/conteudos/estudante/${anoAluno}`);
                setMateriais(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Erro ao carregar materiais");
            }
        };
        fetchMateriais();
    }, [anoAluno]);

    return (
        <div className="aluno-container">
            <header className="welcome-banner">
                <h1>Olá, {nomeAluno}! 👋</h1>
                <p>Você está no modo focado: <strong>{anoAluno.replace('ano', 'º Ano')}</strong></p>
            </header>

            {/* Parte das Notificações / Cronograma */}
            <section>
                <h3 className="secao-titulo">📅 Próximas Atividades (Cronograma)</h3>
                {materiais.filter(m => m.dataEntrega).map(m => (
                    <div key={m._id} className="notificacao-cronograma">
                        <strong>{m.titulo}</strong> - Entrega sugerida até: {new Date(m.dataEntrega).toLocaleDateString()}
                    </div>
                ))}
            </section>

            {/* Listagem de Aulas e Materiais */}
            <section>
                <h3 className="secao-titulo">📚 Meus Materiais de Estudo</h3>
                <div className="grid-materias">
                    {loading ? <p>Carregando trilha de estudos...</p> : 
                        materiais.map(item => (
                            <div key={item._id} className="card-materia">
                                <span className="tag-ano">{item.anoEscolar.toUpperCase()}</span>
                                <h4 style={{marginTop: '10px'}}>{item.titulo}</h4>
                                <p style={{color: '#64748b', fontSize: '14px'}}>{item.materia}</p>
                                <div style={{marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{fontSize: '20px'}}>{item.tipo === 'video' ? '🎥' : '📝'}</span>
                                    <button style={{
                                        border: 'none', 
                                        background: '#2563eb', 
                                        color: 'white', 
                                        padding: '5px 15px', 
                                        border-radius: '5px',
                                        cursor: 'pointer'
                                    }}>Acessar</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </section>
        </div>
    );
}

export default AlunoDashboard;