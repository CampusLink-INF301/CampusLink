import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

const ROLE_OPTIONS = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
  { value: 'institucion', label: 'Institución' },
] as const;

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [error, setError] = useState('');

  const selectedRole = ROLE_OPTIONS[roleIndex];

  const extractErrorMessage = (value: unknown) => {
    if (!value || typeof value !== 'object' || !('response' in value)) {
      return 'Error al registrarse. Revisa los datos ingresados.';
    }

    const response = (value as { response?: { data?: unknown } }).response;
    const data = response?.data;

    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      Array.isArray((data as { message?: unknown }).message)
    ) {
      return (data as { message: string[] }).message.join(' ');
    }

    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message?: unknown }).message === 'string'
    ) {
      return (data as { message: string }).message;
    }

    return 'Error al registrarse. Revisa los datos ingresados.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await authApi.register({
        name,
        email,
        password,
        role: selectedRole.value,
      });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/opportunities');
    } catch (error: unknown) {
      setError(extractErrorMessage(error));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">Únete a la comunidad de CampusLink</p>

        {error && <p className="form-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input
              className="form-input"
              data-testid="register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              data-testid="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              data-testid="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Rol</label>
            <select
              className="form-input"
              data-testid="register-role"
              value={roleIndex}
              onChange={(e) => setRoleIndex(Number(e.target.value))}
            >
              {ROLE_OPTIONS.map((option, index) => (
                <option key={option.value} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
            <p style={{ marginTop: 8, fontSize: 13 }}>
              Rol seleccionado: <strong>{selectedRole.label}</strong>
            </p>
          </div>
          <button type="submit" data-testid="btn-register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Crear cuenta
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Ingresar</Link>
        </p>
      </div>
    </div>
  );
}
