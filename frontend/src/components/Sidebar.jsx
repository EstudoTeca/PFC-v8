import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  PenTool, 
  Calendar, 
  PlusCircle, 
  LogOut, 
  Bell, 
  Search 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pegamos os dados do usuário salvos no Login
  const nomeUsuario = localStorage.getItem('nome') || 'Estudante';
  const perfil = localStorage.getItem('perfil'); // ALUNO ou PROFESSOR

  // Definição dos itens do menu
  const menuItems = [
    { icon: <LayoutDashboard size={20}/>, label: "Dashboard", path: "/dashboard" },
    { icon: <BookOpen size={20}/>, label: "Disciplinas", path: "/disciplinas" },
    
    // SÓ APARECE PARA O PROFESSOR
    ...(perfil === 'PROFESSOR' ? [
      { icon: <PlusCircle size={20} className="text-blue-400" />, label: "Área Prof", path: "/professor" }
    ] : []),

    { icon: <GraduationCap size={20}/>, label: "Vestibular", path: "/vestibular" },
    { icon: <PenTool size={20}/>, label: "Praticar", path: "/praticar" },
    { icon: <Calendar size={20}/>, label: "Cronograma", path: "/cronograma" },
  ];

  // Função para deslogar
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      
      {/* --- SIDEBAR FIXA À ESQUERDA --- */}
      <aside className="w-64 bg-[#0a2540] text-white flex flex-col fixed h-full shadow-2xl z-50">
        
        {/* Logo */}
        <div className="p-8">
          <h1 className="text-xl font-bold flex items-center gap-2 italic tracking-tighter">
            <span className="text-blue-400 not-italic text-2xl">🎓</span> 
            EstudoTeca
          </h1>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 px-4 space-y-1">
          <p className="text-gray-500 text-[10px] font-bold uppercase px-4 mb-4 tracking-widest opacity-50">
            Plataforma
          </p>
          
          {menuItems.map((item) => (
            <div 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all group
                ${location.pathname === item.path 
                  ? 'bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-400/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <span className={`${location.pathname === item.path ? 'text-black' : 'group-hover:text-blue-400'}`}>
                {item.icon}
              </span>
              <span className="text-sm tracking-wide">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Perfil e Botão Sair no Rodapé */}
        <div className="p-4 mt-auto">
          <div className="bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg shadow-lg">
                👤
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{nomeUsuario}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                  {perfil === 'PROFESSOR' ? '👨‍🏫 Docente' : '🎓 Aluno Elite'}
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
          >
            <LogOut size={16} /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* --- ÁREA DE CONTEÚDO À DIREITA --- */}
      <main className="flex-1 ml-64 min-h-screen">
        
        {/* TOPBAR (Barra de Pesquisa) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="relative w-96">
            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar aulas, simulados ou redações..." 
              className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-8">
            <button className="relative text-gray-400 hover:text-blue-600 transition-colors">
              <Bell size={22} />
              <span className="absolute top-0 right-0 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l pl-8 border-gray-100">
               <p className="text-sm font-medium text-gray-500">Olá, <span className="font-bold text-black">{nomeUsuario}</span></p>
               <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nomeUsuario}`} alt="avatar" />
               </div>
            </div>
          </div>
        </header>

        {/* Renderiza o conteúdo da página aqui dentro */}
        <div className="p-8">
          {children}
        </div>
      </main>

    </div>
  );
};

export default Sidebar;