import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Disciplinas from './pages/Disciplinas';
import MateriaDetalhe from './pages/MateriaDetalhe';
import ProfessorDashboard from './pages/ProfessorDashboard';
import Vestibular from './pages/Vestibular';
import Praticar from './pages/Praticar';
import Cronograma from './pages/Cronograma';

// Componente de Proteção de Rota
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" />;
};

// Componente de Proteção para Professores
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
                {/* ROTA PÚBLICA: Login e Cadastro */}
                <Route path="/" element={<Login />} />

                {/* ROTAS PRIVADAS (Alunos e Professores) */}
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/disciplinas" element={<PrivateRoute><Disciplinas /></PrivateRoute>} />
                <Route path="/disciplinas/:id" element={<PrivateRoute><MateriaDetalhe /></PrivateRoute>} />
                
                {/* NOVAS ROTAS ATIVAS */}
                <Route path="/vestibular" element={<PrivateRoute><Vestibular /></PrivateRoute>} />
                <Route path="/praticar" element={<PrivateRoute><Praticar /></PrivateRoute>} />
                <Route path="/cronograma" element={<PrivateRoute><Cronograma /></PrivateRoute>} />

                {/* ROTA EXCLUSIVA: Professor */}
                <Route path="/professor" element={<ProfessorRoute><ProfessorDashboard /></ProfessorRoute>} />

                {/* Redirecionamento Padrão */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;