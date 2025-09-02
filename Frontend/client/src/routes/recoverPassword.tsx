import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../auth/constants.ts';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/request-password-reset`, { email });
      if(!response.status){
        throw new Error("Ha ocurrido un error al enviar el correo para el reset de contraseña.");
      };
      
      setMensaje('Correo enviado. Revisá tu bandeja de entrada.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ocurrió un error al enviar el correo.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">Recuperar Contraseña</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Enviar correo</button>
          </form>

          {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;
