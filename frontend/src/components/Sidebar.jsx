import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    BookOpen, 
    GraduationCap, 
    Target, 
    Calendar, 
    PlusCircle, 
    LogOut, 
    Search, 
    Bell, 
    Menu, 
    ChevronLeft 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Estado para controlar se o menu está recolhido ou expandido
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Pegamos os dados do LocalStorage
    const nomeUsuario = localStorage.getItem('nome') || 'Estudante';
    const perfil = localStorage.getItem('perfil') || 'ALUNO';
    const fotoUsuario = localStorage.getItem('foto');

    // Itens do menu
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
        { icon: <BookOpen size={20} />, label: "Disciplinas", path: "/disciplinas" },
        ...(perfil === 'PROFESSOR' ? [
            { icon: <PlusCircle size={20} className="text-blue-400" />, label: "Área Prof", path: "/professor" }
        ] : []),
        { icon: <GraduationCap size={20} />, label: "Vestibular", path: "/vestibular" },
        { icon: <Target size={20} />, label: "Praticar", path: "/praticar" },
        { icon: <Calendar size={20} />, label: "Cronograma", path: "/cronograma" },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            
            {/* === SIDEBAR COM ANIMAÇÃO DE RECOLHIMENTO === */}
            <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-50 transition-all duration-300 ease-in-out`}>
                
                {/* Topo da Sidebar: Logo & Botão de Fechar */}
                <div className={`p-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-800/80`}>
                    {!isCollapsed ? (
                        <>
                            <h1 className="text-xl font-black flex items-center gap-2 italic tracking-tight truncate">
                                <span className="text-blue-500 not-italic text-2xl">🎓</span> 
                                EstudoTeca
                            </h1>
                            <button 
                                onClick={() => setIsCollapsed(true)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Recolher menu"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsCollapsed(false)}
                            className="text-2xl hover:scale-110 transition-transform"
                            title="Expandir menu"
                        >
                            🎓
                        </button>
                    )}
                </div>

                {/* Navegação */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
                    {!isCollapsed && (
                        <p className="text-slate-500 text-[10px] font-bold uppercase px-4 mb-2 tracking-widest truncate">
                            Plataforma
                        </p>
                    )}

                    {menuItems.map((item) => {
                        const ativo = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                title={isCollapsed ? item.label : undefined}
                                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-4'} py-3 rounded-2xl cursor-pointer transition-all text-xs font-bold tracking-wide ${
                                    ativo 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <span className={ativo ? 'text-white' : 'text-slate-400'}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Rodapé da Sidebar: Perfil & Sair */}
                <div className="p-3 border-t border-slate-800/80">
                    {/* Card do Perfil */}
                    <div 
                        onClick={() => navigate('/perfil')}
                        className={`flex items-center ${isCollapsed ? 'justify-center p-1.5' : 'gap-3 p-2.5'} rounded-2xl hover:bg-slate-800/80 cursor-pointer transition-all mb-2 group border border-transparent hover:border-slate-700/50`}
                        title={isCollapsed ? `${nomeUsuario} (Ver Perfil)` : "Clique para editar perfil"}
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center flex-shrink-0">
                            {fotoUsuario ? (
                                <img src={fotoUsuario} alt={nomeUsuario} className="w-full h-full object-cover" />
                            ) : (
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nomeUsuario}`} alt="avatar" />
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                    {nomeUsuario}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase truncate">
                                    {perfil === 'PROFESSOR' ? '👨‍🏫 Docente' : '🎓 Aluno'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botão Sair */}
                    <button 
                        onClick={handleLogout}
                        title={isCollapsed ? "Sair da Conta" : undefined}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'justify-center gap-2 py-2.5'} text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all text-xs font-bold uppercase tracking-wider`}
                    >
                        <LogOut size={16} />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>
            </aside>

            {/* === ÁREA PRINCIPAL COM MARGEM RESPONSIVA === */}
            <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} min-h-screen flex flex-col transition-all duration-300 ease-in-out`}>
                
                {/* Header Superior */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 md:px-8 flex items-center justify-between">
                    
                    <div className="flex items-center gap-4">
                        {/* Botão Hambúrguer no Topo */}
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                        >
                            <Menu size={20} />
                        </button>

                        {/* Barra de Pesquisa */}
                        <div className="relative w-64 md:w-80 lg:w-96">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Pesquisar aulas, simulados ou redações..." 
                                className="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-11 pr-4 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Direita: Notificações e Perfil */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="text-slate-400 hover:text-slate-700 transition-colors relative p-2">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div 
                            onClick={() => navigate('/perfil')}
                            className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-200 cursor-pointer group"
                            title="Editar Perfil"
                        >
                            <p className="text-xs font-semibold text-slate-500 hidden sm:block">
                                Olá, <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{nomeUsuario}</span>
                            </p>
                            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                                {fotoUsuario ? (
                                    <img src={fotoUsuario} alt={nomeUsuario} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nomeUsuario}`} alt="avatar" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Conteúdo Injetado */}
                <div className="p-6 md:p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Sidebar;