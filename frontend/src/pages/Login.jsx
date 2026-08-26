import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', perfil: 'ALUNO', ano: 'Enem' });
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    const rota = isLogin ? 'login' : 'registro';
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${rota}`, formData);
      
      // Salva e vai pro Dashboard
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('nome', res.data.nome);
      localStorage.setItem('perfil', res.data.perfil);
      localStorage.setItem('ano', res.data.ano);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || "Erro de conexão");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
      {/* Luzes de fundo (Design Moderno) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"></div>

      <div className="max-w-[1000px] w-full flex bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden z-10">
        
        {/* LADO INFO */}
        <div className="hidden md:flex w-5/12 p-12 flex-col justify-between border-r border-white/5 bg-gradient-to-br from-blue-600/20 to-transparent">
          <div>
             <div className="flex items-center gap-2 text-white text-2xl font-black italic tracking-tighter">
                <span className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/40 not-italic">🎓</span>
                EstudoTeca
             </div>
             <h2 className="text-white text-4xl font-black mt-20 leading-tight">
                A evolução do seu <span className="text-blue-400">aprendizado</span>.
             </h2>
             <p className="text-slate-400 mt-6 leading-relaxed">
                Plataforma integrada com IA para estudantes de elite que buscam o topo.
             </p>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
             <Sparkles size={14} className="text-blue-400"/> Sistema de Elite
          </div>
        </div>

        {/* LADO FORMULÁRIO */}
        <div className="flex-1 p-12 lg:p-20">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-white text-3xl font-black mb-2 uppercase tracking-tighter">
              {isLogin ? 'Login de Acesso' : 'Cadastre-se'}
            </h3>
            <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="group relative">
                <User className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
                  type="text" placeholder="Nome Completo"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>
            )}

            <div className="group relative">
              <Mail className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="email" placeholder="Seu melhor e-mail"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="password" placeholder="Sua senha"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                onChange={e => setFormData({...formData, senha: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-slate-400 outline-none focus:border-blue-500/50"
                   onChange={e => setFormData({...formData, perfil: e.target.value})}>
                  <option value="ALUNO">ALUNO</option>
                  <option value="PROFESSOR">PROFESSOR</option>
                </select>
                <select className="bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-slate-400 outline-none focus:border-blue-500/50"
                   onChange={e => setFormData({...formData, ano: e.target.value})}>
                  <option value="1ano">1º ANO</option>
                  <option value="2ano">2º ANO</option>
                  <option value="3ano">3º ANO</option>
                  <option value="Enem">ENEM</option>
                </select>
              </div>
            )}

            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 uppercase text-sm tracking-widest">
              {isLogin ? 'Entrar Agora' : 'Começar Minha Jornada'}
              <ArrowRight size={18} />
            </button>
          </form>

          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-slate-500 text-sm font-bold hover:text-white transition-colors uppercase tracking-widest">
            {isLogin ? 'Não possui conta? Registre-se' : 'Já possui conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;