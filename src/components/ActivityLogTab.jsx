import { useState, useEffect } from 'react';

export default function ActivityLogTab({ supabaseUrl, supabaseKey }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      let url = `${supabaseUrl}/rest/v1/activity_log?order=created_at.desc&limit=100`;

      const response = await fetch(url, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        let data = await response.json();
        
        if (filterType) {
          data = data.filter(log => log.action_type === filterType);
        }
        
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'view':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Log</h2>

      <div className="mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Activities</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="view">View</option>
        </select>
      </div>

      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action_type)}`}>
                    {log.action_type.toUpperCase()}
                  </span>
                  <span className="text-gray-900 font-medium">{log.description}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Admin: {log.admin_email}</p>
                  <p>Time: {new Date(log.created_at).toLocaleString()}</p>
                  {log.details && (
                    <p className="mt-1 text-gray-500">Details: {log.details}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {logs.length === 0 && <div className="text-center py-8 text-gray-600">No activity logs</div>}
    </div>
  );
}
