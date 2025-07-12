import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddStoreModal from './AddStoreModal';

const StoreManagement = () => {
  const { stores, getStoreRating } = useAuth();
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const filteredAndSortedStores = stores
    .filter(store => 
      store.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      store.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      store.address.toLowerCase().includes(filters.address.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'rating') {
        aValue = getStoreRating(a.id);
        bValue = getStoreRating(b.id);
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2>Store Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          Add New Store
        </button>
      </div>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Filter by name..."
          className="form-input search-input"
          value={filters.name}
          onChange={(e) => handleFilterChange('name', e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by email..."
          className="form-input search-input"
          value={filters.email}
          onChange={(e) => handleFilterChange('email', e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by address..."
          className="form-input search-input"
          value={filters.address}
          onChange={(e) => handleFilterChange('address', e.target.value)}
        />
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Name {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                  Address {getSortIcon('address')}
                </th>
                <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>
                  Rating {getSortIcon('rating')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedStores.map(store => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td>
                    <div className="rating-display">
                      ⭐ {getStoreRating(store.id) || 'No ratings'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedStores.length === 0 && (
            <div className="text-center" style={{ padding: '40px' }}>
              No stores found matching the current filters.
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddStoreModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default StoreManagement;