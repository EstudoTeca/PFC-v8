import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

function Login() {
    const [isLogin, setIsLogin] = useState(true); // Alterna entre Login e Cadastro
    const [formData, setFormData] = useState({ nome: '', email: '', senha: '', perfil: 'ALUNO' });

    const handleAcao = async (e) => {
        e.preventDefault();
        const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/registro';
        
        try {
            const res = await axios.post(url, formData);
            if (isLogin) {
                // Salva os dados no navegador
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('perfil', res.data.perfil);
                alert(`Bem-vindo, ${res.data.nome}!`);
                window.location.href = '/dashboard'; // Redireciona
            } else {
                alert("Cadastro realizado! Agora faça login.");
                setIsLogin(true);
            }
        } catch (err) {
            alert(err.response.data.error);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Entrar no EstudoTeca' : 'Criar Conta'}</h2>
            
            <form className="auth-form" onSubmit={handleAcao}>
                {!isLogin && (
                    <input type="text" placeholder="Nome Completo" onChange={e => setFormData({...formData, nome: e.target.value})} />
                )}
                <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="password" placeholder="Senha" onChange={e => setFormData({...formData, senha: e.target.value})} />
                
                {!isLogin && (
                    <select onChange={e => setFormData({...formData, perfil: e.target.value})}>
                        <option value="ALUNO">Sou Aluno</option>
                        <option value="PROFESSOR">Sou Professor</option>
                    </select>
                )}

                <button className="btn-auth" type="submit">
                    {isLogin ? 'Entrar' : 'Cadastrar'}
                </button>
            </form>

            <p className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
            </p>
        </div>
    );
}

export default Login;