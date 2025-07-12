import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Store Rating Platform</h1>
        
        <div className="header-user">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-small">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;