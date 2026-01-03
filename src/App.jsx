import { useState, useEffect } from 'react'
import './index.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nnaakuspoqjdyzheklyb.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('applicants')
  const [applicants, setApplicants] = useState([])
  const [sessions, setSessions] = useState([])
  const [token, setToken] = useState(localStorage.getItem('auth_token'))

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true)
      loadApplicants()
    }
  }, [token])

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error_description || 'Login failed')
        return
      }

      localStorage.setItem('auth_token', data.access_token)
      setToken(data.access_token)
      setIsLoggedIn(true)
      setEmail('')
      setPassword('')
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setIsLoggedIn(false)
    setApplicants([])
    setSessions([])
  }

  const loadApplicants = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/applicants`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setApplicants(data || [])
    } catch (err) {
      console.error('Error loading applicants:', err)
    }
  }

  const loadSessions = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/test_sessions`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setSessions(data || [])
    } catch (err) {
      console.error('Error loading sessions:', err)
    }
  }

  const deleteApplicant = async (id) => {
    if (!confirm('Are you sure?')) return

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/applicants?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`
        }
      })
      loadApplicants()
    } catch (err) {
      console.error('Error deleting applicant:', err)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={login}>
          <h1>Admin Login</h1>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <nav>
          <button
            className={activeTab === 'applicants' ? 'active' : ''}
            onClick={() => {
              setActiveTab('applicants')
              loadApplicants()
            }}
          >
            Applicants
          </button>
          <button
            className={activeTab === 'sessions' ? 'active' : ''}
            onClick={() => {
              setActiveTab('sessions')
              loadSessions()
            }}
          >
            Test Sessions
          </button>
          <button
            className={activeTab === 'results' ? 'active' : ''}
            onClick={() => setActiveTab('results')}
          >
            Results
          </button>
        </nav>
        <button className="btn logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        {activeTab === 'applicants' && (
          <div>
            <h2>Applicants</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app) => (
                  <tr key={app.id}>
                    <td>{app.name || 'N/A'}</td>
                    <td>{app.email || 'N/A'}</td>
                    <td>{app.branch || 'N/A'}</td>
                    <td>
                      <button
                        className="btn-small"
                        onClick={() => deleteApplicant(app.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <h2>Test Sessions</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.id}</td>
                    <td>{session.applicant_id || 'N/A'}</td>
                    <td>{session.status || 'N/A'}</td>
                    <td>{new Date(session.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <h2>Results</h2>
            <p>Results dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
