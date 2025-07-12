import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserDashboard from './components/User/UserDashboard';
import StoreOwnerDashboard from './components/StoreOwner/StoreOwnerDashboard';
import Header from './components/Layout/Header';
import './App.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      {user && <Header />}
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getDashboardRoute(user.role)} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getDashboardRoute(user.role)} />} />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/store-owner" element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <StoreOwnerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          user ? <Navigate to={getDashboardRoute(user.role)} /> : <Navigate to="/login" />
        } />
        
        <Route path="/unauthorized" element={
          <div className="unauthorized">
            <h2>Unauthorized Access</h2>
            <p>You don't have permission to access this page.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

function getDashboardRoute(role) {
  switch (role) {
    case 'admin': return '/admin';
    case 'user': return '/user';
    case 'store_owner': return '/store-owner';
    default: return '/login';
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;