import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/opportunities" className="navbar-brand">
        CampusLink
      </Link>
      <div className="navbar-links">
        <Link to="/opportunities" className="nav-link">Oportunidades</Link>
        <Link to="/opportunities/new" className="btn btn-primary btn-sm">
          + Publicar
        </Link>
        {token ? (
          <button onClick={handleLogout} className="btn btn-logout btn-sm">
            Salir
          </button>
        ) : (
          <Link to="/login" className="nav-link">Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
