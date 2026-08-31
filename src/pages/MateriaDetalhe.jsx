import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Edit3, Video, FileText, ArrowLeft, Star, 
  X, Trash2, ChevronRight, Download, ExternalLink 
} from 'lucide-react';

const MateriaDetalhe = () => {
  const { id } = useParams(); // ex: matematica
  const navigate = useNavigate();
  const perfil = localStorage.getItem('perfil'); // ALUNO ou PROFESSOR

  const [anoAtivo, setAnoAtivo] = useState('1ano');
  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o Modal de Revisão
  const [revisaoAberta, setRevisaoAberta] = useState(false);
  const [materialAtivo, setMaterialAtivo] = useState(null);

  // Função para converter link do YouTube para formato Embed (necessário para o Iframe)
  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/conteudos/${id}/${anoAtivo}`);
      setConteudos(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Erro ao carregar dados:", err);
      setConteudos([]);
    }
    setLoading(false);
  };

  useEffect(() => { carregarDados(); }, [id, anoAtivo]);

  const excluirMaterial = async (mId) => {
    if (window.confirm("Deseja excluir este material permanentemente?")) {
      try {
        await axios.delete(`http://localhost:5000/api/conteudos/${mId}`);
        carregarDados();
      } catch (err) { alert("Erro ao excluir"); }
    }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 text-slate-900">
        
        {/* --- HEADER DA MATÉRIA --- */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/disciplinas')} className="p-4 hover:bg-slate-50 rounded-2xl border border-gray-100 transition-all group">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600" />
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{id}</h2>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Trilha de Especialização</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-[22px]">
            {['1ano', '2ano', '3ano', 'Enem'].map((ano) => (
              <button 
                key={ano} 
                onClick={() => setAnoAtivo(ano)}
                className={`px-8 py-3 rounded-[18px] text-xs font-black transition-all uppercase ${anoAtivo === ano ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {ano === 'Enem' ? 'ENEM' : ano.replace('ano', 'º Ano')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LISTA DE CONTEÚDOS (COLUNA ESQUERDA) --- */}
          <div className="lg:col-span-2 space-y-5">
            {loading ? (
              <div className="p-20 text-center uppercase text-xs font-black text-slate-300 tracking-widest animate-pulse font-sans">Sincronizando conteúdos...</div>
            ) : conteudos.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                <p className="text-slate-300 font-bold italic">Nenhum material postado para este período.</p>
              </div>
            ) : (
              conteudos.map((item) => (
                <div key={item.id} className="bg-white p-8 rounded-[32px] border-l-[10px] border-l-yellow-400 shadow-sm flex items-center justify-between group hover:border-l-blue-600 transition-all">
                  <div className="max-w-[65%]">
                    <div className="flex items-center gap-2 mb-2">
                       <h4 className="font-black text-slate-800 text-xl tracking-tight">{item.titulo}</h4>
                       {item.isDestaque && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
                    </div>
                    <p className="text-sm text-slate-400 font-medium italic line-clamp-2 leading-relaxed">
                      {item.elementos?.find(e => e.tipo === 'texto')?.valor || "Abra o material para ver a explicação completa e arquivos."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setMaterialAtivo(item); setRevisaoAberta(true); }}
                      className="flex items-center gap-2 px-6 py-4 bg-slate-50 text-slate-600 font-black text-[10px] rounded-[18px] hover:bg-blue-50 hover:text-blue-600 transition-all uppercase tracking-widest"
                    >
                      <Play size={14} fill="currentColor"/> Revisar
                    </button>

                    {item.temAtividade && (
                      <button className="flex items-center gap-2 px-6 py-4 bg-yellow-400 text-black font-black text-[10px] rounded-[18px] hover:scale-105 transition-all shadow-lg shadow-yellow-400/20 uppercase tracking-widest">
                        <Edit3 size={14}/> Praticar
                      </button>
                    )}

                    {perfil === 'PROFESSOR' && (
                      <button onClick={() => excluirMaterial(item.id)} className="p-4 bg-red-50 text-red-500 rounded-[18px] hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* --- BARRA DE DESTAQUES (COLUNA DIREITA) --- */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 h-fit">
            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-8 uppercase text-[10px] tracking-[0.2em]">
              <Video className="text-red-500" size={18}/> Aulas em Destaque
            </h3>
            <div className="space-y-6">
              {conteudos.filter(c => c.isDestaque).map(dest => {
                const videoBlock = dest.elementos?.find(e => e.tipo === 'video');
                return videoBlock ? (
                  <div key={dest.id} onClick={() => { setMaterialAtivo(dest); setRevisaoAberta(true); }} className="flex gap-4 group cursor-pointer">
                    <div className="w-24 h-16 bg-slate-900 rounded-2xl relative flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                       <Play size={16} className="text-white relative z-10 opacity-50 group-hover:opacity-100" fill="white"/>
                       <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent"></div>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black text-slate-800 leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors">{dest.titulo}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Vídeo Aula</span>
                    </div>
                  </div>
                ) : null;
              })}
              {conteudos.filter(c => c.isDestaque).length === 0 && (
                 <p className="text-[10px] font-bold text-slate-300 text-center uppercase">Sem recomendações</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- PAINEL DE REVISÃO (MODAL) --- */}
      {revisaoAberta && materialAtivo && (
        <div className="fixed inset-0 bg-[#0a2540]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="bg-white w-full max-w-5xl h-full rounded-[40px] shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-300">
            
            {/* Header do Modal */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
              <div className="flex items-center gap-4">
                 <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/20"><FileText size={20}/></div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">{materialAtivo.titulo}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conteúdo de Revisão Completo</p>
                 </div>
              </div>
              <button onClick={() => setRevisaoAberta(false)} className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-4 rounded-2xl transition-all border border-gray-200">
                <X size={24} />
              </button>
            </div>

            {/* Conteúdo dos Blocos */}
            <div className="flex-1 overflow-y-auto p-12 space-y-12">
              {materialAtivo.elementos?.sort((a,b) => a.ordem - b.ordem).map((el, idx) => (
                <div key={idx} className="max-w-3xl mx-auto">
                  
                  {/* Bloco de Texto */}
                  {el.tipo === 'texto' && (
                    <p className="text-xl leading-relaxed text-slate-700 font-medium whitespace-pre-wrap selection:bg-blue-100">
                      {el.valor}
                    </p>
                  )}

                  {/* Bloco de Vídeo (YouTube Iframe) */}
                  {el.tipo === 'video' && (
                    <div className="rounded-[32px] overflow-hidden shadow-2xl bg-black aspect-video border-4 border-slate-100">
                      <iframe
                        className="w-full h-full"
                        src={getYoutubeEmbed(el.valor)}
                        title="Aula EstudoTeca"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {/* Bloco de Imagem */}
                  {el.tipo === 'imagem' && (
                    <div className="space-y-3">
                       <img src={el.valor} alt="Apoio Visual" className="w-full rounded-[32px] shadow-lg border-4 border-white" />
                       <p className="text-center text-[10px] text-slate-400 font-bold uppercase italic tracking-widest">Anexo de Apoio Pedagógico</p>
                    </div>
                  )}

                  {/* Bloco de PDF */}
                  {el.tipo === 'pdf' && (
                    <a href={el.valor} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-10 border-4 border-dashed border-blue-50 rounded-[40px] hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform"><Download size={24}/></div>
                          <div className="text-left">
                             <h5 className="text-xl font-black text-slate-800">Baixar Material PDF</h5>
                             <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Clique para abrir o arquivo completo</p>
                          </div>
                       </div>
                       <ChevronRight className="text-blue-200 group-hover:text-blue-600 transition-colors" size={40}/>
                    </a>
                  )}

                </div>
              ))}
              
              {/* Rodapé Interno do Modal */}
              <div className="py-20 text-center border-t border-gray-50 max-w-3xl mx-auto">
                 <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em] mb-8 italic">Fim do material de estudo</p>
                 {materialAtivo.temAtividade && (
                   <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-12 py-5 rounded-[24px] font-black uppercase text-sm shadow-xl shadow-yellow-400/30 hover:scale-105 transition-all flex items-center gap-3 mx-auto">
                     <Edit3 size={18}/> Iniciar Prática de Questões
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

export default MateriaDetalhe;