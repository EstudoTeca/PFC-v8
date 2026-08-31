import React from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Bell, ChevronRight, TrendingUp, Target, PenTool, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem('nome') || 'Estudante';

    return (
        <Sidebar>
            <div className="p-2 max-w-7xl mx-auto space-y-8">
                
                {/* 1. BANNER DE BOAS-VINDAS */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 rounded-[28px] p-8 md:p-10 relative overflow-hidden text-white shadow-2xl shadow-blue-900/20">
                    <div className="relative z-10">
                        <span className="text-xs font-semibold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                            Foco no ENEM
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-3 mb-2">
                            Bem-vindo de volta, {nomeUsuario}! 🚀
                        </h1>
                        <p className="text-blue-100 max-w-xl text-sm md:text-base leading-relaxed mb-6">
                            Gerencie suas disciplinas, resolva simulados inéditos com IA e acompanhe sua evolução para a aprovação.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={() => navigate('/disciplinas')}
                                className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 shadow-lg shadow-yellow-400/20"
                            >
                                Ver Trilhas de Estudo
                            </button>
                            <button 
                                onClick={() => navigate('/vestibular')}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider backdrop-blur-sm transition-all border border-white/10"
                            >
                                Área Vestibular (IA)
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. CARDS DE ESTATÍSTICAS RÁPIDAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Média Global" value="78%" icon={<TrendingUp size={24} />} color="text-blue-600" />
                    <StatCard label="Simulados Feitos" value="14" icon={<Target size={24} />} color="text-yellow-500" />
                    <StatCard label="Redações Enviadas" value="06" icon={<PenTool size={24} />} color="text-purple-600" />
                </div>

                {/* 3. SEÇÃO INFERIOR: METAS & OFENSIVA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Metas */}
                    <div className="lg:col-span-2 bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Sua Meta de Hoje</h3>
                            <button 
                                onClick={() => navigate('/cronograma')}
                                className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline"
                            >
                                Ver Cronograma <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-[20px] p-8 text-center hover:border-blue-300 transition-colors">
                            <p className="text-slate-500 font-medium text-sm">Você não tem metas agendadas para hoje.</p>
                            <p className="text-slate-400 text-xs mt-1">Dica: use o Tutor IA para planejar sua semana!</p>
                        </div>
                    </div>

                    {/* Card de Ofensiva */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] p-6 text-white shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Flame size={18} className="fill-yellow-400" />
                                Ofensiva de Estudos
                            </div>
                            <h4 className="text-3xl font-black tracking-tight">03 Dias</h4>
                            <p className="text-slate-400 text-xs mt-1">Continue estudando diariamente para manter o ritmo!</p>
                        </div>
                        <div className="pt-6 border-t border-slate-700/50 mt-6 text-xs text-slate-400">
                            EstudoTeca Elite
                        </div>
                    </div>
                </div>

            </div>
        </Sidebar>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3 rounded-2xl bg-slate-50 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    );
}

export default Dashboard;