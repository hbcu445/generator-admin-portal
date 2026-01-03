import { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nnaakuspoqjdyzheklyb.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      // Verify token and fetch admin data
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      // In a real app, you would verify the token with your backend
      // For now, we'll just set a mock user
      setUser({ email: localStorage.getItem('admin_email') });
      setLoading(false);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_email');
    setUser(null);
    setAdminData(null);
    setToken(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        <LoginPage setUser={setUser} setAdminData={setAdminData} setToken={setToken} />
      ) : (
        <DashboardPage 
          user={user} 
          adminData={adminData} 
          onLogout={handleLogout}
          supabaseUrl={SUPABASE_URL}
          supabaseKey={SUPABASE_KEY}
        />
      )}
    </div>
  );
}

export default App;
