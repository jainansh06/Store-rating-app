import { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StoreList from './StoreList';
import PasswordUpdate from '../Common/PasswordUpdate';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('stores');
  const { user } = useAuth();

  // Handle hash-based navigation for password change
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#password') {
        setActiveTab('password');
        window.location.hash = '';
      }
    };

    handleHashChange(); // Check on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const tabs = [
    { id: 'stores', label: 'Browse Stores' },
    { id: 'password', label: 'Change Password' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stores':
        return <StoreList />;
      case 'password':
        return <PasswordUpdate />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {user?.name}</h1>
          <p className="dashboard-subtitle">Browse stores and submit your ratings</p>
        </div>

        <div className="tabs">
          <div className="tab-list">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;
