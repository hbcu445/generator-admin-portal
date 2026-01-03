import { useState, useEffect } from 'react';

export default function ResultsTab({ supabaseUrl, supabaseKey }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchResults();
  }, [filterBranch, filterStatus]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      let url = `${supabaseUrl}/rest/v1/test_sessions?status=eq.completed&select=*,applicants(name,email,branch)&order=completed_at.desc`;

      const response = await fetch(url, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        let data = await response.json();
        
        if (filterBranch) {
          data = data.filter(r => r.branch === filterBranch);
        }
        
        if (filterStatus === 'passed') {
          data = data.filter(r => r.score >= 70);
        } else if (filterStatus === 'failed') {
          data = data.filter(r => r.score < 70);
        }
        
        setResults(data || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.score >= 70).length,
    failed: results.filter(r => r.score < 70).length,
    avgScore: results.length > 0 
      ? (results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length).toFixed(1)
      : 0
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Tests</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Passed (70%+)</p>
          <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Average Score</p>
          <p className="text-2xl font-bold text-purple-600">{stats.avgScore}%</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-4">
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Branches</option>
          <option value="Brighton, CO">Brighton, CO</option>
          <option value="Jacksonville, FL">Jacksonville, FL</option>
          <option value="Austin, TX">Austin, TX</option>
          <option value="Pensacola, FL">Pensacola, FL</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Results</option>
          <option value="passed">Passed Only</option>
          <option value="failed">Failed Only</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Applicant</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Branch</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map(result => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{result.applicants?.name}</td>
                <td className="px-6 py-4 text-sm">{result.applicants?.email}</td>
                <td className="px-6 py-4 text-sm">{result.branch}</td>
                <td className="px-6 py-4 text-sm font-semibold">{result.score}%</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    result.score >= 70
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.score >= 70 ? 'PASSED' : 'FAILED'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {results.length === 0 && <div className="text-center py-8 text-gray-600">No results</div>}
    </div>
  );
}
