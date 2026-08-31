import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { 
  Plus, Trash2, Video, FileText, Image as ImageIcon, 
  Type, File as FilePdf, Send, Star, X, CheckCircle 
} from 'lucide-react';

const ProfessorDashboard = () => {
  const professorId = localStorage.getItem('id');
  const [loading, setLoading] = useState(false);
  const [meusMateriais, setMeusMateriais] = useState([]);

  // 1. ESTADO DO CONTEÚDO BASE
  const [infoBase, setInfoBase] = useState({
    titulo: '', materia: 'Matemática', anoEscolar: '1ano', isDestaque: false
  });

  // 2. ESTADO DOS BLOCOS (REVISÃO)
  const [elementos, setElementos] = useState([]); 

  // 3. ESTADO DAS QUESTÕES (PRATICAR)
  const [atividades, setAtividades] = useState([]);

  // --- FUNÇÕES DE CARREGAMENTO E EXCLUSÃO ---
  const carregarMateriais = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/conteudos/all/all');
      setMeusMateriais(res.data);
    } catch (err) { console.error("Erro ao buscar materiais", err); }
  };

  useEffect(() => { carregarMateriais(); }, []);

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este conteúdo? Isso apagará todos os blocos e questões ligados a ele.")) {
      try {
        await axios.delete(`http://localhost:5000/api/conteudos/${id}`);
        carregarMateriais();
      } catch (err) { alert("Erro ao excluir"); }
    }
  };

  // --- LÓGICA DE BLOCOS E ARQUIVOS ---
  const addBloco = (tipo) => setElementos([...elementos, { tipo, valor: '' }]);
  const removeBloco = (idx) => setElementos(elementos.filter((_, i) => i !== idx));

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      const novosElementos = [...elementos];
      novosElementos[index].valor = res.data.url;
      setElementos(novosElementos);
    } catch (err) { alert("Erro no upload do arquivo"); }
  };

  // --- LÓGICA DE QUESTÕES ---
  const addQuestao = (tipo) => {
    setAtividades([...atividades, { 
      tipo, pergunta: '', midiaUrl: '', opcoesLista: tipo === 'multipla' ? ['', '', '', ''] : [], respostaCorreta: 0 
    }]);
  };

  // --- PUBLICAR TUDO ---
  const handlePublicar = async () => {
    if (!infoBase.titulo) return alert("Por favor, dê um título ao material.");
    if (elementos.length === 0) return alert("Adicione pelo menos um bloco de conteúdo (texto, vídeo ou imagem).");

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/conteudos/completo', {
        conteudo: infoBase,
        elementos,
        atividades,
        professorId
      });
      alert("🚀 Material publicado com sucesso!");
      window.location.reload(); // Recarrega para limpar tudo
    } catch (err) { 
      alert("Erro ao publicar material. Verifique a conexão.");
    } finally { setLoading(false); }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic text-blue-600">Estúdio do Professor</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Crie trilhas de aprendizado completas</p>
          </div>
          <button 
            onClick={handlePublicar} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Send size={18} /> {loading ? "ENVIANDO..." : "PUBLICAR MATERIAL"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-900">
          
          {/* COLUNA ESQUERDA: CONFIGURAÇÕES E HISTÓRICO */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400">Configurações Gerais</h3>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Título da Aula"
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-blue-500/20"
                  onChange={e => setInfoBase({...infoBase, titulo: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-3">
                  <select className="bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none" onChange={e => setInfoBase({...infoBase, materia: e.target.value})}>
                    <option>Matemática</option><option>Português</option><option>Física</option><option>Química</option><option>História</option><option>Biologia</option>
                  </select>
                  <select className="bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none" onChange={e => setInfoBase({...infoBase, anoEscolar: e.target.value})}>
                    <option value="1ano">1º Ano</option><option value="2ano">2º Ano</option><option value="3ano">3º Ano</option><option value="Enem">ENEM</option>
                  </select>
                </div>
                <label className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${infoBase.isDestaque ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-transparent'}`}>
                  <input type="checkbox" className="hidden" onChange={e => setInfoBase({...infoBase, isDestaque: e.target.checked})} />
                  <Star size={18} className={infoBase.isDestaque ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'} />
                  <span className="text-[10px] font-black uppercase text-slate-600">Aula em Destaque</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400">Suas Postagens</h3>
              <div className="space-y-3">
                {meusMateriais.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                    <div className="overflow-hidden">
                       <p className="text-xs font-bold text-slate-700 truncate w-32">{m.titulo}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{m.materia}</p>
                    </div>
                    <button onClick={() => handleExcluir(m.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CONSTRUTOR DE BLOCOS E ATIVIDADES */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* CONSTRUTOR DE REVISÃO */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                  <FileText size={16} className="text-blue-500"/> Conteúdo de Revisão
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => addBloco('texto')} className="bg-slate-100 p-3 rounded-xl text-[9px] font-black hover:bg-blue-500 hover:text-white transition-all">+ TEXTO</button>
                  <button onClick={() => addBloco('video')} className="bg-slate-100 p-3 rounded-xl text-[9px] font-black hover:bg-red-500 hover:text-white transition-all">+ VÍDEO YT</button>
                  <button onClick={() => addBloco('imagem')} className="bg-slate-100 p-3 rounded-xl text-[9px] font-black hover:bg-green-500 hover:text-white transition-all">+ IMAGEM</button>
                  <button onClick={() => addBloco('pdf')} className="bg-slate-100 p-3 rounded-xl text-[9px] font-black hover:bg-orange-500 hover:text-white transition-all">+ PDF</button>
                </div>
              </div>

              <div className="space-y-6">
                {elementos.map((el, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-[24px] relative border border-slate-100 animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => removeBloco(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><X size={18}/></button>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {el.tipo === 'texto' && <Type size={14} className="text-blue-500"/>}
                      {el.tipo === 'video' && <Video size={14} className="text-red-500"/>}
                      {el.tipo === 'imagem' && <ImageIcon size={14} className="text-green-500"/>}
                      {el.tipo === 'pdf' && <FilePdf size={14} className="text-orange-500"/>}
                      <span className="text-[9px] font-black uppercase text-slate-400">{el.tipo}</span>
                    </div>

                    {el.tipo === 'texto' && (
                      <textarea 
                        className="w-full bg-white p-4 rounded-xl outline-none font-medium text-slate-700 h-32 resize-none border border-slate-200"
                        placeholder="Escreva a explicação para o aluno..."
                        onChange={e => {
                          const n = [...elementos];
                          n[idx].valor = e.target.value;
                          setElementos(n);
                        }}
                      />
                    )}

                    {el.tipo === 'video' && (
                      <input 
                        type="text" 
                        className="w-full bg-white p-4 rounded-xl outline-none font-bold text-slate-600 border border-slate-200"
                        placeholder="Cole o link do YouTube (ex: https://www.youtube.com/watch?v=...)"
                        onChange={e => {
                          const n = [...elementos];
                          n[idx].valor = e.target.value;
                          setElementos(n);
                        }}
                      />
                    )}

                    {(el.tipo === 'imagem' || el.tipo === 'pdf') && (
                      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                        {el.valor ? (
                          <span className="text-[10px] font-black text-green-500 uppercase">Arquivo carregado com sucesso!</span>
                        ) : (
                          <input type="file" onChange={e => handleFileUpload(e, idx)} className="text-xs font-bold cursor-pointer" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CONSTRUTOR DE ATIVIDADES */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                   <CheckCircle size={16} className="text-green-500"/> Atividades de Prática
                 </h3>
                 <div className="flex gap-2">
                    <button onClick={() => addQuestao('multipla')} className="bg-slate-100 p-3 rounded-xl text-[9px] font-black hover:bg-green-500 hover:text-white transition-all">+ MÚLTIPLA ESCOLHA</button>
                    <button onClick={() => addQuestao('manual')} className="bg-slate-100 p-3 rounded-xl text-[9px] font-black hover:bg-purple-500 hover:text-white transition-all">+ RESPOSTA MANUAL</button>
                 </div>
               </div>

               <div className="space-y-6">
                  {atividades.map((ativ, qIdx) => (
                    <div key={qIdx} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative">
                      <button onClick={() => setAtividades(atividades.filter((_, i) => i !== qIdx))} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><Trash2 size={20}/></button>
                      
                      <textarea 
                        className="w-full bg-transparent outline-none font-bold text-xl text-slate-700 placeholder:text-slate-300 mb-6 resize-none"
                        placeholder="Enunciado da pergunta..."
                        onChange={e => {
                          const n = [...atividades];
                          n[qIdx].pergunta = e.target.value;
                          setAtividades(n);
                        }}
                      />

                      {ativ.tipo === 'multipla' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {ativ.opcoesLista.map((opt, oIdx) => (
                            <div key={oIdx} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${ativ.respostaCorreta === oIdx ? 'bg-green-100 border-green-300' : 'bg-white border-slate-100'}`}>
                               <input type="radio" name={`q-${qIdx}`} checked={ativ.respostaCorreta === oIdx} onChange={() => {
                                 const n = [...atividades];
                                 n[qIdx].respostaCorreta = oIdx;
                                 setAtividades(n);
                               }}/>
                               <input 
                                type="text" placeholder={`Opção ${String.fromCharCode(65 + oIdx)}`}
                                className="bg-transparent outline-none text-sm w-full font-bold text-slate-600"
                                onChange={e => {
                                  const n = [...atividades];
                                  n[qIdx].opcoesLista[oIdx] = e.target.value;
                                  setAtividades(n);
                                }}
                               />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {ativ.tipo === 'manual' && (
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase italic">Esta questão exige resposta escrita do aluno.</div>
                      )}
                    </div>
                  ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default ProfessorDashboard;