import { useState } from 'react';

const SUPABASE_URL = 'https://nnaakuspoqjdyzheklyb.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export default function LoginPage({ setUser, setAdminData, setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call Supabase Auth API
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error_description || 'Login failed');
        return;
      }

      if (data.access_token) {
        // Store token and user info
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('admin_email', email);
        
        setToken(data.access_token);
        setUser({ email });
        
        // Fetch admin data
        const adminResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/admin_users?email=eq.${email}&select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${data.access_token}`
            }
          }
        );

        if (adminResponse.ok) {
          const adminUsers = await adminResponse.json();
          if (adminUsers.length > 0) {
            setAdminData(adminUsers[0]);
          }
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Generator Source</h1>
          <p className="text-gray-600">Admin Portal</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="admin@generatorsource.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2"><strong>Demo Admin Credentials:</strong></p>
          <p className="text-xs text-gray-600">Email: admin@generatorsource.com</p>
          <p className="text-xs text-gray-600">Password: (provided by system)</p>
        </div>
      </div>
    </div>
  );
}
