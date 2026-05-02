import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/opportunities" className="navbar-brand">
        CampusLink
      </Link>
      <div className="navbar-links">
        <Link to="/opportunities" className="nav-link">Oportunidades</Link>
        {token && (
          <>
            <Link to="/opportunities/new" className="btn btn-primary btn-sm">
              + Publicar
            </Link>
            <Link to="/profile" className="nav-link">Mi Perfil</Link>
            <button onClick={handleLogout} className="btn btn-logout btn-sm">
              Salir
            </button>
          </>
        )}
        {!token && (
          <Link to="/login" className="nav-link">Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
