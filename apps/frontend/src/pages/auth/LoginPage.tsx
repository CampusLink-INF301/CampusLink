import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { token } = await authApi.login({ email, password });
      localStorage.setItem('token', token);
      navigate('/opportunities');
    } catch {
      setError('Credenciales inválidas.');
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: '4rem auto', padding: '1.5rem' }}>
      <h1>Ingresar</h1>
      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Email
          <input data-testid="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 4 }} />
        </label>
        <label>
          Contraseña
          <input data-testid="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 4 }} />
        </label>
        <button type="submit" data-testid="btn-login">Ingresar</button>
        <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
      </form>
    </main>
  );
}
