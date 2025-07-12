import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddUserModal from './AddUserModal';

const UserManagement = () => {
  const { users, setUsers, getStoreRating } = useAuth();
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
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

  const filteredAndSortedUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      user.address.toLowerCase().includes(filters.address.toLowerCase()) &&
      (filters.role === '' || user.role === filters.role)
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
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
        <h2>User Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          Add New User
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
        <select
          className="form-select"
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
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
                <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                  Role {getSortIcon('role')}
                </th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {user.role.replace('_', ' ')}
                  </td>
                  <td>
                    {user.role === 'store_owner' && user.storeId ? 
                      `⭐ ${getStoreRating(user.storeId) || 'No ratings'}` : 
                      'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedUsers.length === 0 && (
            <div className="text-center" style={{ padding: '40px' }}>
              No users found matching the current filters.
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;