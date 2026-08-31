import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Professor.css';

function ProfessorDashboard() {
    const [posts, setPosts] = useState([]);
    const [novoPost, setNovoPost] = useState({
        titulo: '',
        descricao: '',
        tipo: 'video',
        materia: '',
        anoEscolar: 'Enem',
        urlMidia: '',
        dataEntrega: ''
    });

    const professorNome = localStorage.getItem('nome');

    // Carregar postagens do professor
    const carregarPosts = async () => {
        const res = await axios.get('http://localhost:5000/api/conteudos');
        setPosts(res.data);
    };

    useEffect(() => { carregarPosts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/conteudos', novoPost);
            alert("Conteúdo publicado com sucesso!");
            carregarPosts();
        } catch (err) {
            alert("Erro ao publicar");
        }
    };

    return (
        <div className="professor-container">
            <aside className="sidebar">
                <h2>EstudoTeca</h2>
                <p>Painel do Professor</p>
                <hr />
                <nav>
                    <p>📊 Início</p>
                    <p>📚 Minhas Matérias</p>
                    <p>📅 Cronograma</p>
                </nav>
            </aside>

            <main className="main-content">
                <h1>Bem-vindo, Prof. {professorNome}</h1>

                <div className="card-form">
                    <h3>Criar Novo Conteúdo</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-inputs">
                            <input type="text" placeholder="Título da Aula/Atividade" 
                                onChange={e => setNovoPost({...novoPost, titulo: e.target.value})} required />
                            
                            <select onChange={e => setNovoPost({...novoPost, anoEscolar: e.target.value})}>
                                <option value="1ano">1º Ano Médio</option>
                                <option value="2ano">2º Ano Médio</option>
                                <option value="3ano">3º Ano Médio</option>
                                <option value="Enem">Foco ENEM</option>
                            </select>

                            <select onChange={e => setNovoPost({...novoPost, tipo: e.target.value})}>
                                <option value="video">🎥 Vídeo Aula</option>
                                <option value="atividade">📝 Atividade</option>
                            </select>

                            <input type="text" placeholder="Link do Vídeo ou Material" 
                                onChange={e => setNovoPost({...novoPost, urlMidia: e.target.value})} />

                            <input type="text" placeholder="Matéria (Ex: Física)" 
                                onChange={e => setNovoPost({...novoPost, materia: e.target.value})} />

                            <div className="date-group">
                                <label>Data no Cronograma: </label>
                                <input type="date" onChange={e => setNovoPost({...novoPost, dataEntrega: e.target.value})} />
                            </div>
                        </div>
                        
                        <textarea placeholder="Descrição ou instruções" rows="3" style={{width: '100%', marginTop: '10px'}}
                            onChange={e => setNovoPost({...novoPost, descricao: e.target.value})}></textarea>
                        
                        <button type="submit" className="btn-publicar">Publicar no EstudoTeca</button>
                    </form>
                </div>

                <div className="lista-postagens">
                    <h3>Suas Publicações Recentes</h3>
                    {posts.map(post => (
                        <div key={post._id} className="post-item">
                            <div>
                                <strong>{post.titulo}</strong> - <span className="tag">{post.anoEscolar}</span>
                                <p style={{fontSize: '12px', color: '#666'}}>Vence em: {new Date(post.dataEntrega).toLocaleDateString()}</p>
                            </div>
                            <button onClick={async () => {
                                await axios.delete(`http://localhost:5000/api/conteudos/${post._id}`);
                                carregarPosts();
                            }} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>Excluir</button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default ProfessorDashboard;