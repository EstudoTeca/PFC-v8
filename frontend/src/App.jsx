import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das Páginas (Certifique-se de que os nomes dos arquivos estão corretos na pasta src/pages)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Disciplinas from './pages/Disciplinas';
import MateriaDetalhe from './pages/MateriaDetalhe';
import ProfessorDashboard from './pages/ProfessorDashboard';

/**
 * COMPONENTE DE PROTEÇÃO (PrivateRoute)
 * Verifica se o usuário tem um token no navegador.
 * Se não estiver logado, redireciona para a tela de Login (/).
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

/**
 * COMPONENTE DE PROTEÇÃO PARA PROFESSORES (ProfessorRoute)
 * Além do token, verifica se o perfil é 'PROFESSOR'.
 */
const ProfessorRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const perfil = localStorage.getItem('perfil');
  
  if (!token || perfil !== 'PROFESSOR') {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ROTA PÚBLICA: Tela de Entrada e Cadastro */}
        <Route path="/" element={<Login />} />

        {/* ROTAS PRIVADAS: Necessário Login */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/disciplinas" 
          element={
            <PrivateRoute>
              <Disciplinas />
            </PrivateRoute>
          } 
        />

        {/* Rota Dinâmica para cada matéria (ex: /disciplinas/matematica) */}
        <Route 
          path="/disciplinas/:id" 
          element={
            <PrivateRoute>
              <MateriaDetalhe />
            </PrivateRoute>
          } 
        />

        {/* ROTA EXCLUSIVA: Só Professores acessam */}
        <Route 
          path="/professor" 
          element={
            <ProfessorRoute>
              <ProfessorDashboard />
            </ProfessorRoute>
          } 
        />

        {/* ROTAS QUE VAMOS CRIAR EM BREVE (Por enquanto redirecionam pro Dashboard) */}
        <Route path="/vestibular" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/praticar" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/cronograma" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* REDIRECIONAMENTO GLOBAL: Se a rota não existir, volta pro Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;