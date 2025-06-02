import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './reset-password.css'; // archivo CSS separado
import { API_URL } from '../auth/constants.ts';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);

  useEffect(() => {
    const validarToken = async () => {
      try {
        await axios.get(`${API_URL}/auth/validate-reset-token?token=${token}`);
        setTokenValido(true);
      } catch (err: any) {
        setTokenValido(false);
        setError('Token inválido o expirado');
      }
    };

    validarToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      setMensaje('Contraseña actualizada con éxito. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al actualizar contraseña');
    }
  };

  if (tokenValido === false) return <p className="error">Token inválido o expirado</p>;
  if (tokenValido === null) return <p>Cargando...</p>;

  return (
    <div className="reset-container">
      <h2>Restablecer Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <label>Nueva contraseña:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Cambiar contraseña</button>
      </form>
      {mensaje && <p className="mensaje">{mensaje}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ResetPassword;
