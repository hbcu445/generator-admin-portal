import { useState, useEffect } from 'react';

export default function TestSessionsTab({ supabaseUrl, supabaseKey }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    applicant_id: '',
    branch: '',
    skill_level: ''
  });
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetchSessions();
    fetchApplicants();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/test_sessions?select=*,applicants(name,email)&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/applicants?select=id,name,email,branch`,
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
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const testLink = `${window.location.origin}?session=${Math.random().toString(36).substr(2, 9)}`;
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${supabaseUrl}/rest/v1/test_sessions`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            applicant_id: formData.applicant_id,
            branch: formData.branch,
            skill_level: formData.skill_level,
            test_link: testLink,
            status: 'pending',
            created_at: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        fetchSessions();
        setFormData({ applicant_id: '', branch: '', skill_level: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Delete this session?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/test_sessions?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Test Sessions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Create Session'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateSession} className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={formData.applicant_id}
              onChange={(e) => {
                const applicant = applicants.find(a => a.id === e.target.value);
                setFormData({
                  ...formData,
                  applicant_id: e.target.value,
                  branch: applicant?.branch || ''
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Applicant</option>
              {applicants.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <input type="text" placeholder="Branch" value={formData.branch} readOnly className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
            <select
              value={formData.skill_level}
              onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Skill Level</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Create Session
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Applicant</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Branch</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Skill Level</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map(session => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{session.applicants?.name}</td>
                <td className="px-6 py-4 text-sm">{session.branch}</td>
                <td className="px-6 py-4 text-sm">{session.skill_level}</td>
                <td className="px-6 py-4 text-sm"><span className="px-3 py-1 rounded-full text-xs bg-yellow-100">{session.status}</span></td>
                <td className="px-6 py-4 text-sm">{session.score ? `${session.score}%` : '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => handleDeleteSession(session.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sessions.length === 0 && <div className="text-center py-8 text-gray-600">No sessions</div>}
    </div>
  );
}
