import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StoreCard from './StoreCard';

const StoreList = () => {
  const { stores } = useAuth();
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    address: ''
  });

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
    store.address.toLowerCase().includes(searchFilters.address.toLowerCase())
  );

  return (
    <div>
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by store name..."
          className="form-input search-input"
          value={searchFilters.name}
          onChange={(e) => handleFilterChange('name', e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by address..."
          className="form-input search-input"
          value={searchFilters.address}
          onChange={(e) => handleFilterChange('address', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {filteredStores.map(store => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '60px' }}>
            <h3>No stores found</h3>
            <p>Try adjusting your search criteria.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreList;