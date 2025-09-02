import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './reset-password.css';
import { API_URL } from '../../auth/constants.ts';
import Mensaje from './mensaje.tsx';

function validarPassword(password: string): string | null {
  if (password.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe incluir al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Debe incluir al menos una minúscula';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Debe incluir al menos un carácter especial';
  return null;
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConf, setNewPasswordConf] = useState<string>('')
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
      const resultado = validarPassword(newPassword);
      if(typeof resultado === 'string'){
        setError(`${resultado}`);
        return;
      };

      if(newPassword !== newPasswordConf){
        setError('Las contraseñas no coinciden');
        return;
      };
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
        <ul className="password-checklist">
          <li className={/[A-Z]/.test(newPassword) ? 'ok' : ''}>✔ Mayúscula</li>
          <li className={/[a-z]/.test(newPassword) ? 'ok' : ''}>✔ Minúscula</li>
          <li className={/[0-9]/.test(newPassword) ? 'ok' : ''}>✔ Número</li>
          <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'ok' : ''}>✔ Carácter especial</li>
          <li className={newPassword.length >= 8 ? 'ok' : ''}>✔ Mínimo 8 caracteres</li>
        </ul>
        <label>Vuelva a ingresar su nueva contraseña:</label>
        <input
          type="password"
          value={newPasswordConf}
          onChange={(e) => setNewPasswordConf(e.target.value)}
          required
        />
        <button type="submit">Cambiar contraseña</button>
      </form>
      {mensaje && <Mensaje tipo="exito" texto={mensaje} />}
      {error && <Mensaje tipo="error" texto={error} />}
    </div>
  );
};

export default ResetPassword;
