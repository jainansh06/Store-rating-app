import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - In real app, this would come from a backend
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'System Administrator User Name Here',
      email: 'admin@example.com',
      password: 'Admin123!',
      address: '123 Admin Street, Admin City, Admin State 12345',
      role: 'admin'
    }
  ]);

  const [stores, setStores] = useState([]);

  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (userData) => {
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser = {
      id: users.length + 1,
      ...userData,
      role: 'user'
    };

    setUsers(prev => [...prev, newUser]);
    
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const foundUser = users.find(u => u.id === user.id);
    if (foundUser && foundUser.password === currentPassword) {
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, password: newPassword } : u
      ));
      return { success: true };
    }
    return { success: false, error: 'Current password is incorrect' };
  };

  const addUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const addStore = (storeData) => {
    let ownerId = storeData.existingOwnerId || null;
    
    // If creating a new owner, add them first
    if (storeData.createNewOwner) {
      const newOwner = {
        id: users.length + 1,
        name: `Store Owner for ${storeData.name}`,
        email: storeData.ownerEmail,
        password: storeData.ownerPassword,
        address: storeData.address,
        role: 'store_owner'
      };
      setUsers(prev => [...prev, newOwner]);
      ownerId = newOwner.id;
    }
    
    const newStore = {
      id: stores.length + 1,
      name: storeData.name,
      email: storeData.email,
      address: storeData.address,
      ownerId: ownerId,
      ratings: []
    };
    setStores(prev => [...prev, newStore]);
    return newStore;
  };

  const submitRating = (storeId, rating) => {
    const newRating = {
      id: ratings.length + 1,
      storeId,
      userId: user.id,
      rating,
      date: new Date().toISOString()
    };
    
    setRatings(prev => {
      // Remove existing rating by same user for same store
      const filtered = prev.filter(r => !(r.storeId === storeId && r.userId === user.id));
      return [...filtered, newRating];
    });
    
    return newRating;
  };

  const getStoreRating = (storeId) => {
    const storeRatings = ratings.filter(r => r.storeId === storeId);
    if (storeRatings.length === 0) return 0;
    
    const average = storeRatings.reduce((sum, r) => sum + r.rating, 0) / storeRatings.length;
    return Math.round(average * 10) / 10;
  };

  const getUserRatingForStore = (storeId) => {
    const userRating = ratings.find(r => r.storeId === storeId && r.userId === user?.id);
    return userRating?.rating || 0;
  };

  const getStoreRatings = (storeId) => {
    return ratings.filter(r => r.storeId === storeId);
  };

  const value = {
    user,
    loading,
    users,
    stores,
    ratings,
    login,
    register,
    logout,
    updatePassword,
    addUser,
    addStore,
    submitRating,
    getStoreRating,
    getUserRatingForStore,
    getStoreRatings,
    setUsers,
    setStores
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
