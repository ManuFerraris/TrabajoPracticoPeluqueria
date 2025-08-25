import React from 'react';
import DefaultLayout from '../layout/DefaultLayout.tsx';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.tsx';
import { API_URL } from '../auth/constants.ts';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import axios from "axios";
import { getRutaInicioPorRol } from '../components/GetRutaInicioPorRol.tsx';

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const auth = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const data = response.data
            console.log('Datos de respuesta con axios:', data);

            // Guardar tokens y autenticar usuario
            auth.login(
                data.accessToken,
                data.refreshToken,
                {
                codigo: data.user.codigo,
                email: data.user.email,
                rol: data.user.rol,
                nombre: data.user.NomyApe || data.user.nombre,
                },
            );

            const destino = getRutaInicioPorRol(data.user.rol);
            navigate(destino, { replace: true });

        } catch (error) {
            console.error('Error en login:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    if (auth.isAuthenticated) {
        const destino = getRutaInicioPorRol(auth.user?.rol || '');
        return <Navigate to={destino} replace />;
    };

    return (
        <DefaultLayout>
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                    <div className="card-body p-4">
                        <div className="text-center mb-4">
                            <h2 className="card-title">Iniciar Sesión</h2>
                            <p className="text-muted">Ingresa tus credenciales para continuar</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    className="form-control"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label">Contraseña</label>
                                <input 
                                    type="password" 
                                    className="form-control"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 py-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Iniciando sesión...
                                    </>
                                ) : 'Iniciar Sesión'}
                            </button>

                            <div className="text-center mt-3">
                                <Link to="/recuperar" className="text-decoration-none">
                                ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                        </form>

                        <div className="mt-3 text-center">
                            <p className="text-muted">
                                ¿No tienes cuenta?{' '}
                                <a href="/signup" className="text-decoration-none">Regístrate aquí</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};