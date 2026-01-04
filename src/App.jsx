import { useState, useEffect, useRef } from 'react'
import './index.css'
import { sendTestResultEmail } from './emailService'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nnaakuspoqjdyzheklyb.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('results')
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
  const [processedResults, setProcessedResults] = useState(new Set())
  const pollingInterval = useRef(null)

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true)
      loadApplicants()
      loadSessions()
      loadResults()
      loadQuestions()
      loadAdminUsers()
      
      // Start polling for new results every 30 seconds
      pollingInterval.current = setInterval(() => {
        checkForNewResults()
      }, 30000)
    }
    
    // Cleanup interval on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
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
      
      // Mark all existing results as processed (don't send emails for old results)
      if (processedResults.size === 0 && data.length > 0) {
        const existingIds = new Set(data.map(r => r.id))
        setProcessedResults(existingIds)
        console.log(`✅ Marked ${existingIds.size} existing results as processed`)
      }
    } catch (err) {
      console.error('Error loading results:', err)
    }
  }

  const checkForNewResults = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/results?order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      const data = await response.json()
      
      // Check for new results that haven't been processed
      for (const result of data) {
        if (!processedResults.has(result.id)) {
          console.log(`📧 New result detected: ${result.applicant_name} (ID: ${result.id})`)
          
          // Find branch manager email
          const branchManager = adminUsers.find(
            admin => admin.branch_location === result.branch && admin.role === 'admin'
          )
          const branchManagerEmail = branchManager?.email || null
          
          if (branchManagerEmail) {
            console.log(`✅ Branch manager found: ${branchManagerEmail}`)
          } else {
            console.log(`⚠️ No branch manager found for ${result.branch}`)
          }
          
          // Send email
          const emailSent = await sendTestResultEmail(result, branchManagerEmail)
          
          if (emailSent) {
            // Mark as processed
            setProcessedResults(prev => new Set([...prev, result.id]))
            console.log(`✅ Email sent for result ID: ${result.id}`)
          }
        }
      }
      
      // Update results display
      setResults(data || [])
    } catch (err) {
      console.error('Error checking for new results:', err)
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
                          <a 
                            href={result.report_pdf} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-small"
                          >
                            View Report
                          </a>
                        ) : (
                          <span style={{color: '#999'}}>N/A</span>
                        )}
                      </td>
                      <td>
                        {result.certificate_pdf && result.passed ? (
                          <a 
                            href={result.certificate_pdf} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-small"
                          >
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
