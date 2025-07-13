import { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StoreRatings from './StoreRatings';
import PasswordUpdate from '../Common/PasswordUpdate';

const StoreOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('ratings');
  const { user, stores, getStoreRating } = useAuth();

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
  // Find the store owned by this user
  const ownedStore = stores.find(store => store.ownerId === user?.id);
  const storeRating = ownedStore ? getStoreRating(ownedStore.id) : 0;

  const tabs = [
    { id: 'ratings', label: 'Store Ratings' },
    { id: 'password', label: 'Change Password' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'ratings':
        return <StoreRatings store={ownedStore} />;
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
          <h1 className="dashboard-title">Store Owner Dashboard</h1>
          {ownedStore ? (
            <div>
              <p className="dashboard-subtitle">Managing: {ownedStore.name}</p>
              <div className="stats-grid" style={{ gridTemplateColumns: '1fr', marginTop: '20px' }}>
                <div className="stat-card">
                  <div className="stat-number">{storeRating > 0 ? storeRating.toFixed(1) : 'No ratings'}</div>
                  <div className="stat-label">Average Store Rating</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="dashboard-subtitle">No store assigned to your account</p>
          )}
        </div>

        {ownedStore && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
