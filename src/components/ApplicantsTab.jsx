import { useState, useEffect } from 'react';

export default function ApplicantsTab({ supabaseUrl, supabaseKey }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: ''
  });

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/applicants?order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApplicants(data || []);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplicant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/applicants`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            branch: formData.branch,
            status: 'active'
          })
        }
      );

      if (response.ok) {
        const newApplicant = await response.json();
        setApplicants([newApplicant[0] || newApplicant, ...applicants]);
        setFormData({ name: '', email: '', phone: '', branch: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error adding applicant:', error);
    }
  };

  const handleDeleteApplicant = async (id) => {
    if (!confirm('Are you sure you want to delete this applicant?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/applicants?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setApplicants(applicants.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting applicant:', error);
    }
  };

  const filteredApplicants = applicants.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading applicants...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Applicant'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddApplicant} className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Branch</option>
              <option value="Brighton, CO">Brighton, CO</option>
              <option value="Jacksonville, FL">Jacksonville, FL</option>
              <option value="Austin, TX">Austin, TX</option>
              <option value="Pensacola, FL">Pensacola, FL</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Save Applicant
          </button>
        </form>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Branch</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredApplicants.map(applicant => (
              <tr key={applicant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{applicant.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{applicant.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{applicant.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{applicant.branch}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    applicant.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {applicant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDeleteApplicant(applicant.id)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredApplicants.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No applicants found
        </div>
      )}
    </div>
  );
}
