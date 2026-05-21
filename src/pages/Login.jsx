import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// 🔑 CAMBIA TU CONTRASEÑA AQUÍ FÁCILMENTE CUANDO QUIERAS
const ADMIN_PASSWORD = 'Jefriz23'; 

export default function Login({ session, onSignIn }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (session) {
            navigate('/ventas', { replace: true });
        }
    }, [session, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            setMessage('Ingresa un usuario y contraseña válidos.');
            return;
        }

        setLoading(true);
        setMessage('');

        const identifier = email.trim().toLowerCase();
        
        // 1. Validar que el usuario sea estrictamente 'familia'
        if (identifier !== 'familia') {
            setMessage('Solo se permite ingresar con la cuenta familia.');
             setLoading(false);
            return;
        }

        // 2. Validar la contraseña usando la constante local
        if (password !== ADMIN_PASSWORD) {
            setMessage('Usuario o contraseña incorrectos.');
            setLoading(false);
            return;
        }

        // 3. Si todo está bien, simulamos la sesión y entramos al sistema
        // Pasamos un objeto que simula la estructura de sesión que espera tu App.js
        onSignIn({ user: { email: 'familia' } });
        navigate('/ventas', { replace: true });
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <span className="brand-emoji">🐓</span>
                    <div>
                        <h1>Distribuidora A.Z.R</h1>
                        <p>Accede para registrar ventas y ver tu historial.</p>
                    </div>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label>
                        Usuario
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="id"
                            disabled={loading}
                        />
                    </label>

                    <label>
                        Contraseña
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            disabled={loading}
                        />
                    </label>

                    {message && <div className="login-message">{message}</div>}

                    <button className="login-submit" type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}