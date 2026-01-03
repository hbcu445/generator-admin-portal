import { useState, useEffect } from 'react';

export default function BranchesTab({ supabaseUrl, supabaseKey, adminData }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/branches?order=name`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBranches(data || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    
    if (adminData?.role !== 'upper_management') {
      alert('Only upper management can add branches');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/branches`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            location: formData.location
          })
        }
      );

      if (response.ok) {
        fetchBranches();
        setFormData({ name: '', location: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error adding branch:', error);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!confirm('Delete this branch?')) return;

    if (adminData?.role !== 'upper_management') {
      alert('Only upper management can delete branches');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/branches?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setBranches(branches.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const canManageBranches = adminData?.role === 'upper_management';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Branches</h2>
        {canManageBranches && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Branch'}
          </button>
        )}
      </div>

      {showForm && canManageBranches && (
        <form onSubmit={handleAddBranch} className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Branch Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Save Branch
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{branch.location}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Created: {new Date(branch.created_at).toLocaleDateString()}
              </span>
              {canManageBranches && (
                <button
                  onClick={() => handleDeleteBranch(branch.id)}
                  className="text-red-600 hover:text-red-900 font-medium text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {branches.length === 0 && <div className="text-center py-8 text-gray-600">No branches</div>}
    </div>
  );
}
