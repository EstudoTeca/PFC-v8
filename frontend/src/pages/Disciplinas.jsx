import React from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const disciplinas = [
  { id: 'matematica', nome: 'Matemática', icon: '🔢', cor: 'blue' },
  { id: 'portugues', nome: 'Português', icon: '🔤', cor: 'orange' },
  { id: 'literatura', nome: 'Literatura', icon: '📖', cor: 'amber' },
  { id: 'quimica', nome: 'Química', icon: '🧪', cor: 'emerald' },
  { id: 'fisica', nome: 'Física', icon: '⚛️', cor: 'yellow' },
  { id: 'biologia', nome: 'Biologia', icon: '⏳', cor: 'green' },
  { id: 'historia', nome: 'História', icon: '📜', cor: 'stone' },
  { id: 'geografia', nome: 'Geografia', icon: '🌍', cor: 'cyan' },
];

const Disciplinas = () => {
  const navigate = useNavigate();

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-800">Trilhas de Estudo</h2>
          <p className="text-slate-500 font-medium italic">Domine cada conteúdo com revisões e questões práticas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {disciplinas.map((disc) => (
            <div 
              key={disc.id}
              onClick={() => navigate(`/disciplinas/${disc.id}`)}
              className="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-4xl">{disc.icon}</span>
                <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
                  <span className="text-slate-300 group-hover:text-blue-500">→</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-6">{disc.nome}</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Domínio</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[0%] rounded-full transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
};

export default Disciplinas;