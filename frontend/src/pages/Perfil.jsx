import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { User, Shield, Trash2, Camera, Key, Mail, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Perfil() {
    const navigate = useNavigate();
    const usuarioId = localStorage.getItem('id');

    // Estados do Perfil
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [ano, setAno] = useState('Enem');
    const [perfil, setPerfil] = useState('ALUNO');
    const [foto, setFoto] = useState('');
    const [carregandoFoto, setCarregandoFoto] = useState(false);
    const [salvandoPerfil, setSalvandoPerfil] = useState(false);

    // Estados de Segurança
    const [novoEmail, setNovoEmail] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [salvandoSeguranca, setSalvandoSeguranca] = useState(false);

    // Carregar dados atuais do usuário
    useEffect(() => {
        const carregarDados = async () => {
            if (!usuarioId) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/usuario/${usuarioId}`);
                setNome(res.data.nome || '');
                setEmail(res.data.email || '');
                setNovoEmail(res.data.email || '');
                setAno(res.data.ano || 'Enem');
                setPerfil(res.data.perfil || 'ALUNO');
                setFoto(res.data.foto || '');
            } catch (err) {
                console.error("Erro ao carregar dados do perfil:", err);
            }
        };
        carregarDados();
    }, [usuarioId]);

    // Upload da Foto de Perfil
    const handleUploadFoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setCarregandoFoto(true);
        try {
            const res = await axios.post('http://localhost:5000/api/upload', formData);
            setFoto(res.data.url);
            // Salva de imediato no banco
            await axios.put(`http://localhost:5000/api/usuario/${usuarioId}`, {
                nome, ano, foto: res.data.url
            });
            localStorage.setItem('foto', res.data.url);
            alert("Foto de perfil atualizada com sucesso!");
        } catch (err) {
            alert("Erro ao fazer upload da imagem.");
        } finally {
            setCarregandoFoto(false);
        }
    };

    // Salvar Dados Básicos (Nome e Ano)
    const handleSalvarPerfil = async (e) => {
        e.preventDefault();
        setSalvandoPerfil(true);
        try {
            const res = await axios.put(`http://localhost:5000/api/usuario/${usuarioId}`, {
                nome, ano, foto
            });
            localStorage.setItem('nome', res.data.nome);
            localStorage.setItem('ano', res.data.ano);
            alert("Perfil atualizado com sucesso!");
        } catch (err) {
            alert("Erro ao atualizar o perfil.");
        } finally {
            setSalvandoPerfil(false);
        }
    };

    // Salvar Segurança (E-mail e Senha)
    const handleSalvarSeguranca = async (e) => {
        e.preventDefault();
        if (!senhaAtual) {
            return alert("Digite sua senha atual para confirmar as alterações.");
        }
        if (novaSenha && novaSenha !== confirmarSenha) {
            return alert("A nova senha e a confirmação não são iguais.");
        }

        setSalvandoSeguranca(true);
        try {
            await axios.put(`http://localhost:5000/api/usuario/${usuarioId}/seguranca`, {
                senhaAtual, novoEmail, novaSenha
            });
            alert("Segurança atualizada com sucesso!");
            setEmail(novoEmail);
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (err) {
            alert(err.response?.data?.error || "Erro ao atualizar segurança.");
        } finally {
            setSalvandoSeguranca(false);
        }
    };

    // Excluir Conta
    const handleExcluirConta = async () => {
        const confirmacao = window.confirm("ATENÇÃO: Tem certeza de que deseja excluir sua conta permanentemente? Todo o seu progresso será apagado.");
        if (!confirmacao) return;

        const senhaConfirmacao = prompt("Por segurança, digite 'DELETAR' para confirmar:");
        if (senhaConfirmacao !== 'DELETAR') {
            return alert("Ação cancelada. A conta não foi excluída.");
        }

        try {
            await axios.delete(`http://localhost:5000/api/usuario/${usuarioId}`);
            alert("Sua conta foi excluída com sucesso.");
            localStorage.clear();
            navigate('/');
        } catch (err) {
            alert("Erro ao excluir conta.");
        }
    };

    return (
        <Sidebar>
            <div className="p-2 max-w-5xl mx-auto space-y-8">
                
                {/* CABEÇALHO */}
                <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-6">
                    {/* Foto com Botão de Troca */}
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-100 flex items-center justify-center text-slate-400">
                            {foto ? (
                                <img src={foto} alt={nome} className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-md transition-transform hover:scale-110">
                            {carregandoFoto ? <RefreshCw size={16} className="animate-spin" /> : <Camera size={16} />}
                            <input type="file" accept="image/*" onChange={handleUploadFoto} className="hidden" />
                        </label>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                            {perfil === 'PROFESSOR' ? 'Docente' : 'Estudante'}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-1">
                            {nome || 'Minha Conta'}
                        </h2>
                        <p className="text-slate-400 text-xs md:text-sm">{email}</p>
                    </div>
                </div>

                {/* SEÇÃO 1: DADOS PESSOAIS */}
                <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-100 space-y-6">
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                        <User className="text-blue-600" size={20} /> Informações Básicas
                    </h3>

                    <form onSubmit={handleSalvarPerfil} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nome Completo</label>
                            <input 
                                type="text" 
                                value={nome} 
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {perfil === 'ALUNO' && (
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Etapa Escolar / Foco</label>
                                <select 
                                    value={ano} 
                                    onChange={(e) => setAno(e.target.value)}
                                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="1ano">1º Ano do Ensino Médio</option>
                                    <option value="2ano">2º Ano do Ensino Médio</option>
                                    <option value="3ano">3º Ano do Ensino Médio</option>
                                    <option value="Enem">Foco Exclusivo ENEM & Vestibulares</option>
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2 pt-2">
                            <button 
                                type="submit" 
                                disabled={salvandoPerfil}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                            >
                                {salvandoPerfil ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* SEÇÃO 2: SEGURANÇA E ACESSO */}
                <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-100 space-y-6">
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                        <Shield className="text-yellow-500" size={20} /> Segurança & Acesso
                    </h3>

                    <form onSubmit={handleSalvarSeguranca} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Mail size={14} /> E-mail da Conta
                            </label>
                            <input 
                                type="email" 
                                value={novoEmail} 
                                onChange={(e) => setNovoEmail(e.target.value)}
                                className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Key size={14} /> Nova Senha (Opcional)
                                </label>
                                <input 
                                    type="password" 
                                    value={novaSenha} 
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    placeholder="Deixe em branco para não alterar"
                                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmar Nova Senha</label>
                                <input 
                                    type="password" 
                                    value={confirmarSenha} 
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    placeholder="Repita a nova senha"
                                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Confirmação com Senha Atual */}
                        <div className="p-4 bg-yellow-50/70 border border-yellow-200 rounded-2xl space-y-2 mt-4">
                            <label className="text-xs font-bold uppercase tracking-wider text-yellow-800 block">
                                Senha Atual (Obrigatória para confirmar alterações de segurança)
                            </label>
                            <input 
                                type="password" 
                                value={senhaAtual} 
                                onChange={(e) => setSenhaAtual(e.target.value)}
                                placeholder="Digite sua senha atual"
                                className="w-full p-3 bg-white border border-yellow-300 rounded-xl text-sm outline-none text-slate-800"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={salvandoSeguranca}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                        >
                            {salvandoSeguranca ? "Atualizando..." : "Atualizar Segurança"}
                        </button>
                    </form>
                </div>

                {/* SEÇÃO 3: ZONA DE PERIGO (Excluir Conta) */}
                <div className="bg-red-50/60 p-6 md:p-8 rounded-[28px] border border-red-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h4 className="font-bold text-red-900 text-base flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-600" /> Zona de Perigo
                        </h4>
                        <p className="text-xs text-red-700 mt-1 max-w-xl">
                            Ao excluir sua conta, todas as suas notas de redações, metas do cronograma e acessos serão apagados para sempre.
                        </p>
                    </div>
                    <button 
                        onClick={handleExcluirConta}
                        className="bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Excluir Minha Conta
                    </button>
                </div>

            </div>
        </Sidebar>
    );
}

export default Perfil;