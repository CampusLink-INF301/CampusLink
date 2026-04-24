import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ background: '#1a73e8', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/opportunities" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 20 }}>
        CampusLink
      </Link>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Link to="/opportunities" style={{ color: '#fff', textDecoration: 'none' }}>Oportunidades</Link>
        <Link to="/opportunities/new" style={{ color: '#fff', textDecoration: 'none' }}>+ Publicar</Link>
        {token ? (
          <button onClick={handleLogout} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 4, cursor: 'pointer' }}>
            Salir
          </button>
        ) : (
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
