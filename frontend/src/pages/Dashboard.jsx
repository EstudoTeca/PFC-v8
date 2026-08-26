import React from 'react';
import Sidebar from '../components/Sidebar'; // Importando a Sidebar que tem a lógica de navegação
import { Search, Bell, ChevronRight, TrendingUp, Target, PenTool, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Pegando o nome do usuário que salvamos no Login
  const nomeUsuario = localStorage.getItem('nome') || 'Estudante';

  return (
    <Sidebar>
      {/* 1. TOPBAR - BARRA DE PESQUISA E PERFIL */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-10">
        <div className="relative w-96">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar matérias, PDFs ou simulados..." 
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-8">
          {/* Botão de Notificação */}
          <button className="relative text-gray-400 hover:text-blue-600 transition-colors">
            <Bell size={22} />
            <span className="absolute top-0 right-0 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
          </button>

          {/* Info do Usuário */}
          <div className="flex items-center gap-3">
             <p className="text-sm font-medium text-gray-500">Olá, <span className="font-bold text-black">{nomeUsuario}</span></p>
             <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nomeUsuario}`} alt="avatar" />
             </div>
          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL DO DASHBOARD */}
      <div className="p-12 max-w-7xl mx-auto">
        
        {/* BANNER DE BOAS-VINDAS (ESTILO ELITE) */}
        <div className="bg-[#0a2540] rounded-[40px] p-16 relative overflow-hidden text-white mb-10 shadow-2xl shadow-blue-900/20">
          <div className="relative z-10">
            <h2 className="text-5xl font-black mb-6 tracking-tight italic">
              Foco na <span className="text-yellow-400">Aprovação.</span>
            </h2>
            <p className="text-gray-300 max-w-lg text-lg leading-relaxed mb-10">
              Gerencie suas disciplinas, resolva simulados inéditos com IA e acompanhe sua evolução em tempo real rumo ao ENEM.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/disciplinas')}
                className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-yellow-400/20"
              >
                Ver Trilhas
              </button>
              <button 
                onClick={() => navigate('/vestibular')}
                className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-bold text-sm backdrop-blur-sm transition-all border border-white/10"
              >
                Provas Oficiais
              </button>
            </div>
          </div>
          {/* Efeito Visual no fundo do Banner */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[30%] w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>
        </div>

        {/* 3. CARDS DE ESTATÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <StatCard label="Média Global" value="0%" icon={<TrendingUp size={24}/>} color="text-blue-500" />
          <StatCard label="Simulados" value="0" icon={<Target size={24}/>} color="text-yellow-500" />
          <StatCard label="Redações" value="0" icon={<PenTool size={24}/>} color="text-purple-500" />
        </div>

        {/* 4. SEÇÃO INFERIOR: METAS E OFENSIVA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna de Metas (Larga) */}
          <div className="lg:col-span-2 bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold text-xl text-gray-800">🎯 Sua Meta de Hoje</h3>
               <button 
                onClick={() => navigate('/cronograma')}
                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline transition-all"
               >
                 Ver Cronograma <ChevronRight size={16}/>
               </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-100 rounded-[24px] p-16 text-center group hover:border-blue-200 transition-colors">
              <p className="text-slate-400 font-medium text-lg">Você não tem metas agendadas para hoje.</p>
              <p className="text-slate-300 text-sm mt-2 uppercase tracking-widest font-black">
                Dica: Use a <span className="text-yellow-500">IA Tutor</span> para gerar um plano!
              </p>
            </div>
          </div>

          {/* Coluna da Ofensiva (Estreita) */}
          <div className="bg-[#0a2540] rounded-[32px] p-10 text-white flex flex-col items-center justify-center text-center shadow-xl shadow-blue-900/10 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 justify-center">
                  <Flame size={14} className="fill-yellow-400"/> Ofensiva de Estudos
                </p>
                <span className="text-8xl font-black block mb-2 tracking-tighter group-hover:scale-110 transition-transform">3</span>
                <span className="text-xl font-bold opacity-60">Dias Seguindo</span>
              </div>
              
              {/* Marca d'água no fundo do card */}
              <div className="absolute bottom-[-20px] right-[-20px] text-white/5 text-9xl font-black italic select-none">
                ESTUDO
              </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
};

/**
 * Sub-componente para os Cards de Estatística
 */
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-default">
    <div className={`p-4 rounded-2xl bg-slate-50 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

export default Dashboard;