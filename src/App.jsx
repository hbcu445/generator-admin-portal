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
  const [results, setResults] = useState([])
  const [questions, setQuestions] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminRole, setNewAdminRole] = useState('admin')
  const [newAdminBranch, setNewAdminBranch] = useState('')
  const [token, setToken] = useState(localStorage.getItem('auth_token'))

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true)
      loadApplicants()
      loadSessions()
      loadResults()
      loadQuestions()
      loadAdminUsers()
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

  const loadResults = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/results?order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      const data = await response.json()
      setResults(data || [])
    } catch (err) {
      console.error('Error loading results:', err)
    }
  }

  const loadQuestions = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/questions?order=question_number.asc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      const data = await response.json()
      setQuestions(data || [])
    } catch (err) {
      console.error('Error loading questions:', err)
    }
  }

  const loadAdminUsers = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      const data = await response.json()
      setAdminUsers(data || [])
    } catch (err) {
      console.error('Error loading admin users:', err)
    }
  }

  const addNewAdmin = async (e) => {
    e.preventDefault()
    if (!newAdminEmail || !newAdminPassword) {
      alert('Email and password are required')
      return
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          role: newAdminRole,
          branch_location: newAdminBranch || null,
          created_by: email
        })
      })

      if (response.ok) {
        setNewAdminEmail('')
        setNewAdminPassword('')
        setNewAdminRole('admin')
        setNewAdminBranch('')
        alert('Admin user created successfully')
        loadAdminUsers()
      } else {
        alert('Error creating admin user')
      }
    } catch (err) {
      console.error('Error adding admin:', err)
      alert('Error creating admin user')
    }
  }

  const deleteAdminUser = async (id) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })

      if (response.ok) {
        alert('Admin user removed successfully')
        loadAdminUsers()
      } else {
        alert('Error removing admin user')
      }
    } catch (err) {
      console.error('Error deleting admin:', err)
      alert('Error removing admin user')
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
            className={activeTab === 'results' ? 'active' : ''}
            onClick={() => setActiveTab('results')}
          >
            Test Results
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

        {activeTab === 'results' && (
          <div>
            <h2>Test Results</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Level</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Time (min)</th>
                  <th>Passed</th>
                  <th>Report</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{textAlign: 'center'}}>No test results yet</td>
                  </tr>
                ) : (
                  results.map((result) => (
                    <tr key={result.id}>
                      <td>{result.applicant_name || 'N/A'}</td>
                      <td>{result.applicant_email || 'N/A'}</td>
                      <td>{result.applicant_phone || 'N/A'}</td>
                      <td>{result.branch || 'N/A'}</td>
                      <td>{result.skill_level || 'N/A'}</td>
                      <td>{result.test_date ? new Date(result.test_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{result.score}/{result.total_questions} ({result.percentage}%)</td>
                      <td>{result.time_taken_seconds ? Math.floor(result.time_taken_seconds / 60) : 'N/A'}</td>
                      <td>
                        <span style={{color: result.passed ? 'green' : 'red', fontWeight: 'bold'}}>
                          {result.passed ? 'PASSED' : 'NOT PASSED'}
                        </span>
                      </td>
                      <td>
                        {result.report_pdf ? (
                          <a href={result.report_pdf} target="_blank" rel="noopener noreferrer" className="btn-small">
                            View Report
                          </a>
                        ) : (
                          <span style={{color: '#999'}}>N/A</span>
                        )}
                      </td>
                      <td>
                        {result.certificate_pdf && result.passed ? (
                          <a href={result.certificate_pdf} target="_blank" rel="noopener noreferrer" className="btn-small">
                            View Certificate
                          </a>
                        ) : (
                          <span style={{color: '#999'}}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
