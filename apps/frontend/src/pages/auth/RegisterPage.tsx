import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { token } = await authApi.register({ name, email, password });
      localStorage.setItem('token', token);
      navigate('/opportunities');
    } catch {
      setError('Error al registrarse. El email puede estar en uso.');
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: '4rem auto', padding: '1.5rem' }}>
      <h1>Registro</h1>
      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Nombre
          <input data-testid="register-name" value={name} onChange={(e) => setName(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 4 }} />
        </label>
        <label>
          Email
          <input data-testid="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 4 }} />
        </label>
        <label>
          Contraseña
          <input data-testid="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={{ display: 'block', width: '100%', marginTop: 4 }} />
        </label>
        <button type="submit" data-testid="btn-register">Registrarse</button>
        <p>¿Ya tienes cuenta? <Link to="/login">Ingresar</Link></p>
      </form>
    </main>
  );
}
