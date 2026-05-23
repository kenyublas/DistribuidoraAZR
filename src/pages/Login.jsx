import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

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
            setMessage('Ingresa tu correo y contraseña.');
            return;
        }

        setLoading(true);
        setMessage('');

        // Login REAL con Supabase Auth (correo + contraseña)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password,
        });

        if (error) {
            // Mensajes claros según el tipo de error
            if (error.message.includes('Invalid login credentials')) {
                setMessage('Correo o contraseña incorrectos.');
            } else if (error.message.includes('Email not confirmed')) {
                setMessage('El correo no está confirmado. Actívalo en Supabase.');
            } else {
                setMessage('No se pudo iniciar sesión. Intenta de nuevo.');
            }
            setLoading(false);
            return;
        }

        // Sesión válida: avisamos a App.js y entramos
        if (data?.session) {
            onSignIn(data.session);
            navigate('/ventas', { replace: true });
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand"> {/* Mantener el div */}
                    <span className="brand-emoji"></span>
                    <div>
                        <h1>Distribuidora A.Z.R</h1>
                        <p>Accede para registrar ventas y ver tu historial.</p>
                    </div>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label>
                        Correo
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tucorreo@gmail.com"
                            disabled={loading}
                            autoComplete="email"
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
                            autoComplete="current-password"
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