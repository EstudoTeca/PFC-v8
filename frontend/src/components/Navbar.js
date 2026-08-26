import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Navbar.css';

function Navbar() {
    const [notificacoes, setNotificacoes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const usuarioId = localStorage.getItem('usuarioId'); // Salve o ID no login!

    useEffect(() => {
        const buscarNotas = async () => {
            if (!usuarioId) return;
            const res = await axios.get(`http://localhost:5000/api/notificacoes/${usuarioId}`);
            setNotificacoes(res.data);
        };

        buscarNotas();
        // Opcional: buscar novas notificações a cada 1 minuto
        const interval = setInterval(buscarNotas, 60000);
        return () => clearInterval(interval);
    }, [usuarioId]);

    return (
        <nav className="navbar">
            <div className="logo">EstudoTeca</div>
            
            <div className="nav-icons">
                <div className="noti-bell" onClick={() => setShowDropdown(!showDropdown)}>
                    🔔
                    {notificacoes.length > 0 && (
                        <span className="badge">{notificacoes.length}</span>
                    )}
                </div>

                {showDropdown && (
                    <div className="noti-dropdown">
                        <h4>Notificações</h4>
                        {notificacoes.length === 0 ? <p>Tudo em dia!</p> : 
                            notificacoes.map(n => (
                                <div key={n._id} className="noti-item">
                                    {n.mensagem}
                                </div>
                            ))
                        }
                    </div>
                )}
                
                <button onClick={() => {localStorage.clear(); window.location.reload();}}>Sair</button>
            </div>
        </nav>
    );
}

export default Navbar;