import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Plus, Trash2, Timer, Play, Pause, RotateCcw, BrainCircuit, GraduationCap } from 'lucide-react';

function Cronograma() {
    const usuarioId = localStorage.getItem('id'); // Pegando o ID do Mongo gerado no Login
    
    const [metas, setMetas] = useState([]);
    const [tarefasProfessores, setTarefasProfessores] = useState([]);
    const [novaMeta, setNovaMeta] = useState('');
    const [dataMeta, setDataMeta] = useState('');

    // POMODORO STATES
    const tempoTrabalho = 25 * 60; // 25 minutos
    const tempoDescanso = 5 * 60;  // 5 minutos
    const [tempoRestante, setTempoRestante] = useState(tempoTrabalho);
    const [timerRodando, setTimerRodando] = useState(false);
    const [modo, setModo] = useState('trabalho'); // 'trabalho' ou 'descanso'

    // IA STATES
    const [horasDisp, setHorasDisp] = useState('2');
    const [focoIA, setFocoIA] = useState('Exatas');
    const [carregandoIA, setCarregandoIA] = useState(false);

    // Carregar Cronograma do Banco
    const carregarCronograma = async () => {
        if (!usuarioId) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/cronograma/${usuarioId}`);
            setMetas(res.data.metas);
            setTarefasProfessores(res.data.tarefasProfessor);
        } catch (err) { console.error("Erro ao carregar cronograma."); }
    };

    useEffect(() => { carregarCronograma(); }, []);

    // Controle do Pomodoro
    useEffect(() => {
        let intervalo;
        if (timerRodando && tempoRestante > 0) {
            intervalo = setInterval(() => setTempoRestante(t => t - 1), 1000);
        } else if (tempoRestante === 0) {
            alert(modo === 'trabalho' ? "Sessão concluída! Hora de descansar." : "Descanso acabou! De volta aos estudos.");
            setModo(modo === 'trabalho' ? 'descanso' : 'trabalho');
            setTempoRestante(modo === 'trabalho' ? tempoDescanso : tempoTrabalho);
            setTimerRodando(false);
        }
        return () => clearInterval(intervalo);
    }, [timerRodando, tempoRestante, modo]);

    const formatarTempo = (segundos) => {
        const m = Math.floor(segundos / 60).toString().padStart(2, '0');
        const s = (segundos % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Ações das Metas
    const handleAdicionarMeta = async (e) => {
        e.preventDefault();
        if (!novaMeta.trim()) return;
        try {
            await axios.post('http://localhost:5000/api/cronograma', {
                usuarioId, texto: novaMeta, data: dataMeta || "Hoje", origem: "manual"
            });
            setNovaMeta(''); setDataMeta('');
            carregarCronograma();
        } catch (err) { alert("Erro ao salvar meta."); }
    };

    const toggleMeta = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/cronograma/${id}`);
            carregarCronograma();
        } catch (err) { alert("Erro ao atualizar meta."); }
    };

    const excluirMeta = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/cronograma/${id}`);
            carregarCronograma();
        } catch (err) { alert("Erro ao excluir meta."); }
    };

    // Gerador de Plano IA
    const gerarPlanoIA = async () => {
        setCarregandoIA(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ia/gerar-plano', { horas: horasDisp, foco: focoIA });
            // IA retorna um array de objetos. Vamos salvar cada um no banco.
            for (let tarefa of res.data) {
                await axios.post('http://localhost:5000/api/cronograma', {
                    usuarioId, texto: tarefa.texto, data: "Hoje (Sugerido pela IA)", origem: "ia"
                });
            }
            carregarCronograma();
            alert("Plano de estudos gerado com sucesso!");
        } catch (err) {
            alert("Erro ao criar plano com a IA.");
        } finally {
            setCarregandoIA(false);
        }
    };

    return (
        <Sidebar>
            <div className="p-2 max-w-7xl mx-auto space-y-6">
                
                {/* HEADER */}
                <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <CalendarIcon className="text-blue-600" />
                            Cronograma & Foco
                        </h2>
                        <p className="text-slate-500 text-xs md:text-sm mt-1">
                            Planeje suas metas diárias e utilize a técnica Pomodoro.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* COLUNA ESQUERDA: LISTA DE METAS E AGENDAMENTOS */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Formulário Nova Meta */}
                        <form onSubmit={handleAdicionarMeta} className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
                            <input 
                                type="text" value={novaMeta} onChange={(e) => setNovaMeta(e.target.value)}
                                placeholder="Criar nova tarefa (Ex: Ler 2 capítulos de História)"
                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm outline-none font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                            />
                            <input 
                                type="text" value={dataMeta} onChange={(e) => setDataMeta(e.target.value)}
                                placeholder="Data/Prazo (Ex: Sexta)"
                                className="w-full md:w-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md">
                                <Plus size={16} /> Adicionar
                            </button>
                        </form>

                        {/* Avisos do Professor */}
                        {tarefasProfessores.length > 0 && (
                            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[24px]">
                                <h3 className="font-bold text-indigo-900 text-sm mb-3 flex items-center gap-2">
                                    <GraduationCap size={18} /> Agendamentos dos Professores
                                </h3>
                                <div className="space-y-2">
                                    {tarefasProfessores.map(tarefa => (
                                        <div key={tarefa.id} className="bg-white p-3 rounded-xl border border-indigo-100 flex justify-between items-center text-xs md:text-sm">
                                            <span className="font-semibold text-slate-700">{tarefa.titulo} - {tarefa.materia}</span>
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold">
                                                Prazo: {new Date(tarefa.dataEntrega).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metas Pessoais */}
                        <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-100 space-y-4">
                            <h3 className="font-bold text-slate-800 text-base">Meu Plano de Ação</h3>
                            {metas.length === 0 && <p className="text-slate-400 text-xs">Nenhuma meta agendada. Adicione manualmente ou use a IA!</p>}
                            
                            <div className="space-y-3">
                                {metas.map(meta => (
                                    <div key={meta.id} className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${meta.concluida ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <div className="flex items-start md:items-center gap-3">
                                            <button 
                                                onClick={() => toggleMeta(meta.id)}
                                                className={`w-6 h-6 mt-0.5 md:mt-0 rounded-lg border flex-shrink-0 flex items-center justify-center transition-colors ${meta.concluida ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}
                                            >
                                                {meta.concluida && <CheckCircle2 size={16} />}
                                            </button>
                                            <div>
                                                <span className={`text-sm font-semibold block ${meta.concluida ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                    {meta.texto}
                                                </span>
                                                {meta.origem === 'ia' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">Sugerido por IA</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 ml-9 md:ml-0">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                                                <Clock size={12} /> {meta.data}
                                            </span>
                                            <button onClick={() => excluirMeta(meta.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: POMODORO E IA */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Timer Pomodoro */}
                        <div className="bg-slate-900 text-white p-8 rounded-[28px] shadow-xl text-center relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 opacity-10"><Timer size={120} /></div>
                            <h3 className="font-bold text-slate-300 uppercase tracking-widest text-xs mb-2">Assistente de Foco</h3>
                            <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold mb-6 ${modo === 'trabalho' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                                {modo === 'trabalho' ? 'Modo Estudo (25m)' : 'Modo Descanso (5m)'}
                            </div>
                            
                            <div className="text-6xl font-black tracking-tighter mb-8 font-mono">
                                {formatarTempo(tempoRestante)}
                            </div>
                            
                            <div className="flex justify-center gap-3">
                                <button 
                                    onClick={() => setTimerRodando(!timerRodando)}
                                    className={`p-4 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 ${timerRodando ? 'bg-red-500 hover:bg-red-400' : 'bg-blue-600 hover:bg-blue-500'}`}
                                >
                                    {timerRodando ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                                </button>
                                <button 
                                    onClick={() => { setTimerRodando(false); setTempoRestante(modo === 'trabalho' ? tempoTrabalho : tempoDescanso); }}
                                    className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors"
                                >
                                    <RotateCcw size={24} />
                                </button>
                            </div>
                        </div>

                        {/* IA Geradora de Plano */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 md:p-8 rounded-[28px] shadow-sm border border-yellow-200">
                            <h3 className="font-black text-yellow-800 text-lg flex items-center gap-2 mb-4">
                                <BrainCircuit size={20} /> IA Planejadora
                            </h3>
                            <p className="text-xs text-yellow-700 mb-4 leading-relaxed">
                                Deixe a IA organizar o que você deve estudar hoje com base no seu tempo livre!
                            </p>
                            
                            <div className="space-y-3 mb-5">
                                <div>
                                    <label className="text-[10px] font-bold text-yellow-700 uppercase">Horas Livres Hoje</label>
                                    <select value={horasDisp} onChange={(e)=>setHorasDisp(e.target.value)} className="w-full mt-1 p-2 bg-white rounded-lg border border-yellow-200 text-sm outline-none text-slate-700">
                                        <option value="1">1 Hora</option>
                                        <option value="2">2 Horas</option>
                                        <option value="3">3 Horas</option>
                                        <option value="4+">4+ Horas</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-yellow-700 uppercase">Foco Principal</label>
                                    <input value={focoIA} onChange={(e)=>setFocoIA(e.target.value)} placeholder="Ex: Exatas, Redação..." className="w-full mt-1 p-2 bg-white rounded-lg border border-yellow-200 text-sm outline-none text-slate-700"/>
                                </div>
                            </div>
                            
                            <button 
                                onClick={gerarPlanoIA} disabled={carregandoIA}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {carregandoIA ? "Mapeando Cronograma..." : "Criar Plano com IA"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}

export default Cronograma;