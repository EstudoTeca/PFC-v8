import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css'; // Importando o CSS separado

function Dashboard() {
    const [conteudos, setConteudos] = useState([]);
    const [form, setForm] = useState({ titulo: '', tipo: 'video', materia: 'Matemática' });

    // Carregar dados (Read)
    useEffect(() => {
        fetchConteudos();
    }, []);

    const fetchConteudos = async () => {
        const res = await axios.get('http://localhost:5000/api/conteudos');
        setConteudos(res.data);
    };

    // Salvar dados (Create)
    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/conteudos', form);
        alert("Conteúdo postado!");
        fetchConteudos(); // Atualiza a lista
    };

    return (
        <div className="dashboard-container">
            <h1>EstudoTeca - Painel</h1>

            {/* Formulário para o Professor */}
            <form className="form-cadastro" onSubmit={handleSubmit}>
                <input placeholder="Título da Aula" onChange={e => setForm({...form, titulo: e.target.value})} />
                <select onChange={e => setForm({...form, tipo: e.target.value})}>
                    <option value="video">Vídeo Aula</option>
                    <option value="atividade">Atividade</option>
                </select>
                <button type="submit">Postar Conteúdo</button>
            </form>

            {/* Listagem para o Aluno */}
            <div className="lista">
                {conteudos.map(item => (
                    <div key={item._id} className="card-aula">
                        <h3>{item.titulo}</h3>
                        <p>Matéria: {item.materia} | Tipo: {item.tipo}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;