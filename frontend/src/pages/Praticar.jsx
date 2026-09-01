import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { CheckCircle2, AlertCircle, HelpCircle, Layers } from 'lucide-react';

function Praticar() {
    const [materiais, setMateriais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroMateria, setFiltroMateria] = useState('all');
    const [respostas, setRespostas] = useState({});

    useEffect(() => {
        const carregar = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/conteudos/all/all');
                // Filtra apenas conteúdos que possuem atividades cadastradas
                const comAtividades = (res.data || []).filter(c => c.atividades && c.atividades.length > 0);
                setMateriais(comAtividades);
            } catch (err) {
                console.error("Erro ao carregar banco de questões:", err);
            } finally {
                setLoading(false);
            }
        };
        carregar();
    }, []);

    const listaFiltrada = filtroMateria === 'all' 
        ? materiais 
        : materiais.filter(m => m.materia.toLowerCase() === filtroMateria.toLowerCase());

    return (
        <Sidebar>
            <div className="p-2 max-w-7xl mx-auto space-y-8">
                
                {/* HEADER */}
                <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Layers className="text-blue-600" />
                            Banco de Questões & Exercícios
                        </h2>
                        <p className="text-slate-500 text-xs md:text-sm mt-1">
                            Resolva exercícios práticos preparados pelos professores para fixar o aprendizado.
                        </p>
                    </div>

                    <select 
                        value={filtroMateria}
                        onChange={(e) => setFiltroMateria(e.target.value)}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    >
                        <option value="all">Todas as Matérias</option>
                        <option value="Matemática">Matemática</option>
                        <option value="Português">Português</option>
                        <option value="Física">Física</option>
                        <option value="Química">Química</option>
                        <option value="Biologia">Biologia</option>
                        <option value="História">História</option>
                        <option value="Geografia">Geografia</option>
                    </select>
                </div>

                {/* LISTAGEM DE ATIVIDADES */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400 text-sm">Carregando questões...</div>
                ) : listaFiltrada.length === 0 ? (
                    <div className="bg-white p-12 rounded-[24px] border border-slate-100 text-center text-slate-400 text-xs">
                        Nenhuma atividade cadastrada para esta matéria ainda.
                    </div>
                ) : (
                    listaFiltrada.map(conteudo => (
                        <div key={conteudo.id} className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-100 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                        {conteudo.materia} • {conteudo.anoEscolar}
                                    </span>
                                    <h3 className="text-lg font-black text-slate-800 mt-2">{conteudo.titulo}</h3>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {conteudo.atividades.map((ativ, idx) => (
                                    <div key={ativ.id || idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                        <p className="text-sm font-bold text-slate-800">
                                            <span className="text-blue-600">Exercício {idx + 1}:</span> {ativ.pergunta}
                                        </p>

                                        {ativ.tipo === 'multipla' && ativ.opcoes && (
                                            <div className="space-y-2">
                                                {ativ.opcoes.map((opcao, optIdx) => {
                                                    const keyResp = `${conteudo.id}-${ativ.id}`;
                                                    const respondeu = respostas[keyResp] !== undefined;
                                                    const selecionada = respostas[keyResp] === optIdx;
                                                    const isCorreta = ativ.respostaCorreta === optIdx;

                                                    let estilo = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100";
                                                    if (respondeu) {
                                                        if (isCorreta) estilo = "bg-green-100 border-green-300 text-green-800 font-bold";
                                                        else if (selecionada && !isCorreta) estilo = "bg-red-100 border-red-300 text-red-800";
                                                    }

                                                    return (
                                                        <button
                                                            key={opcao.id || optIdx}
                                                            disabled={respondeu}
                                                            onClick={() => setRespostas({ ...respostas, [keyResp]: optIdx })}
                                                            className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all flex items-center justify-between ${estilo}`}
                                                        >
                                                            <span>{opcao.texto}</span>
                                                            {respondeu && isCorreta && <CheckCircle2 size={18} className="text-green-600" />}
                                                            {respondeu && selecionada && !isCorreta && <AlertCircle size={18} className="text-red-600" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {ativ.tipo === 'manual' && (
                                            <div className="p-4 bg-blue-50/60 rounded-xl text-xs text-blue-700">
                                                📝 <b>Questão Dissertativa:</b> Escreva a resposta em seu caderno e compare com as anotações da aula.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}

            </div>
        </Sidebar>
    );
}

export default Praticar;