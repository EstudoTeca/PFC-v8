import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Vestibular.css';

function VestibularArea() {
    // Estados para Redação
    const [redacao, setRedacao] = useState('');
    const [resultadoRedacao, setResultadoRedacao] = useState(null);
    const [carregandoRedacao, setCarregandoRedacao] = useState(false);

    // Estados para Simulado
    const [questoes, setQuestoes] = useState([]);
    const [materiaSimulado, setMateriaSimulado] = useState('Matemática');

    // Função para Corrigir Redação
    const corrigirRedacao = async () => {
        setCarregandoRedacao(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ia/corrigir-redacao', {
                texto: redacao,
                tema: "O impacto da IA na educação brasileira"
            });
            setResultadoRedacao(res.data);
        } catch (err) { alert("Erro na correção"); }
        setCarregandoRedacao(false);
    };

    // Função para Gerar Simulado
    const gerarQuestoes = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/ia/gerar-simulado', { materia: materiaSimulado });
            setQuestoes(res.data);
        } catch (err) { alert("Erro ao gerar questões"); }
    };

    return (
        <div className="aluno-container">
            <h1>🎓 Foco Vestibular & ENEM</h1>
            
            <div className="vestibular-grid">
                {/* LADO ESQUERDO: REDAÇÃO */}
                <div className="card-vestibular">
                    <h3>📝 Prática de Redação</h3>
                    <p><small>Tema: O impacto da IA na educação brasileira</small></p>
                    <textarea 
                        className="editor-redacao" 
                        placeholder="Escreva sua redação aqui..."
                        value={redacao}
                        onChange={(e) => setRedacao(e.target.value)}
                    ></textarea>
                    <button className="btn-auth" onClick={corrigirRedacao} disabled={carregandoRedacao}>
                        {carregandoRedacao ? "Corrigindo..." : "Corrigir com IA"}
                    </button>

                    {resultadoRedacao && (
                        <div className="resultado-redacao">
                            <h4>Nota Total: {resultadoRedacao.total}</h4>
                            <div className="notas-grid">
                                <div className="nota-box">C1: {resultadoRedacao.c1}</div>
                                <div className="nota-box">C2: {resultadoRedacao.c2}</div>
                                <div className="nota-box">C3: {resultadoRedacao.c3}</div>
                                <div className="nota-box">C4: {resultadoRedacao.c4}</div>
                                <div className="nota-box">C5: {resultadoRedacao.c5}</div>
                            </div>
                            <p style={{marginTop: '10px', fontSize: '14px'}}>{resultadoRedacao.feedback}</p>
                        </div>
                    )}
                </div>

                {/* LADO DIREITO: SIMULADO */}
                <div className="card-vestibular">
                    <h3>⚡ Simulado Rápido (IA)</h3>
                    <select onChange={(e) => setMateriaSimulado(e.target.value)}>
                        <option>Matemática</option>
                        <option>Física</option>
                        <option>História</option>
                        <option>Biologia</option>
                    </select>
                    <button onClick={gerarQuestoes} style={{marginLeft: '10px'}}>Gerar 3 Questões</button>

                    <div className="lista-questoes" style={{marginTop: '20px'}}>
                        {questoes.map((q, idx) => (
                            <div key={idx} className="questao-card">
                                <p><strong>{idx + 1}.</strong> {q.pergunta}</p>
                                {q.opcoes.map((opt, i) => (
                                    <button key={i} className="opcao-btn" onClick={() => alert(i === q.correta ? "Correto! " + q.explicacao : "Errado!")}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VestibularArea;