import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';
import PasswordUpdate from '../Common/PasswordUpdate';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { users, stores, ratings } = useAuth();

  const totalUsers = users.filter(u => u.role !== 'admin').length;
  const totalStores = stores.length;
  const totalRatings = ratings.length;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'User Management' },
    { id: 'stores', label: 'Store Management' },
    { id: 'password', label: 'Change Password' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{totalStores}</div>
                <div className="stat-label">Total Stores</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{totalRatings}</div>
                <div className="stat-label">Total Ratings</div>
              </div>
            </div>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'stores':
        return <StoreManagement />;
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
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Manage users, stores, and view platform statistics</p>
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

export default AdminDashboard;