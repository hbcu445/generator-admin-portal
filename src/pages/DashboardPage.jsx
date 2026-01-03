import { useState, useEffect } from 'react';
import ApplicantsTab from '../components/ApplicantsTab';
import TestSessionsTab from '../components/TestSessionsTab';
import ResultsTab from '../components/ResultsTab';
import BranchesTab from '../components/BranchesTab';
import ActivityLogTab from '../components/ActivityLogTab';

const SUPABASE_URL = 'https://nnaakuspoqjdyzheklyb.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

export default function DashboardPage({ user, adminData, onLogout, supabaseUrl, supabaseKey }) {
  const [activeTab, setActiveTab] = useState('applicants');
  const [stats, setStats] = useState({
    totalApplicants: 0,
    totalSessions: 0,
    totalTests: 0,
    passedTests: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch applicants count
      const applicantsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/applicants?select=count()`,
        { headers }
      );
      const applicantsData = await applicantsRes.json();
      const applicantsCount = applicantsData[0]?.count || 0;

      // Fetch test sessions count
      const sessionsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/test_sessions?select=count()`,
        { headers }
      );
      const sessionsData = await sessionsRes.json();
      const sessionsCount = sessionsData[0]?.count || 0;

      // Fetch completed tests
      const testsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/test_sessions?status=eq.completed&select=count()`,
        { headers }
      );
      const testsData = await testsRes.json();
      const testsCount = testsData[0]?.count || 0;

      // Fetch passed tests
      const passedRes = await fetch(
        `${SUPABASE_URL}/rest/v1/test_sessions?status=eq.completed&score=gte.70&select=count()`,
        { headers }
      );
      const passedData = await passedRes.json();
      const passedCount = passedData[0]?.count || 0;

      setStats({
        totalApplicants: applicantsCount,
        totalSessions: sessionsCount,
        totalTests: testsCount,
        passedTests: passedCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const tabs = [
    { id: 'applicants', label: 'Applicants', icon: '👥' },
    { id: 'sessions', label: 'Test Sessions', icon: '📝' },
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'branches', label: 'Branches', icon: '🏢' },
    { id: 'activity', label: 'Activity Log', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generator Source Admin</h1>
            <p className="text-gray-600 mt-1">Welcome, {adminData?.role || 'Admin'}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Applicants</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalApplicants}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Test Sessions</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalSessions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Completed Tests</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalTests}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Passed (70%+)</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.passedTests}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'applicants' && <ApplicantsTab supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} />}
            {activeTab === 'sessions' && <TestSessionsTab supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} />}
            {activeTab === 'results' && <ResultsTab supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} />}
            {activeTab === 'branches' && <BranchesTab supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} adminData={adminData} />}
            {activeTab === 'activity' && <ActivityLogTab supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} />}
          </div>
        </div>
      </div>
    </div>
  );
}
