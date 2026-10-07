import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = 'https://localhost:7212'

const dynamicSchema = {
  fields: [
    { key: 'title', label: 'عنوان', type: 'text', required: true },
    { key: 'amount', label: 'مبلغ (تومان)', type: 'number', required: true },
    { key: 'description', label: 'توضیحات', type: 'textarea', required: false },
    {
      key: 'urgency',
      label: 'فوریت',
      type: 'select',
      required: true,
      options: ['کم', 'متوسط', 'زیاد'],
    },
  ],
}

const buildEmptyFormData = () =>
  dynamicSchema.fields.reduce((accumulator, field) => {
    accumulator[field.key] = ''
    return accumulator
  }, {})

const readStoredAuth = () => {
  const raw = localStorage.getItem('requestflow-auth')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function App() {
  const [auth, setAuth] = useState(readStoredAuth)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    role: 'Employee',
  })
  const [formData, setFormData] = useState(buildEmptyFormData)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (auth) {
      localStorage.setItem('requestflow-auth', JSON.stringify(auth))
      fetchRequests(auth.token)
      return
    }

    localStorage.removeItem('requestflow-auth')
    setRequests([])
  }, [auth])

  const fetchRequests = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Unable to load requests.')
      }

      const payload = await response.json()
      setRequests(payload)
    } catch (fetchError) {
      setError(fetchError.message)
    }
  }

  const handleAuthChange = (event) => {
    const { name, value } = event.target
    setAuthForm((current) => ({ ...current, [name]: value }))
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = authMode === 'register' ? 'register' : 'login'
      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
          role: authForm.role,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.title ?? 'Authentication failed.')
      }

      setAuth({
        token: payload.token,
        email: payload.email,
        roles: payload.roles,
      })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }))
  }

  const handleCreateRequest = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const invalidField = dynamicSchema.fields.find((field) => {
      if (!field.required) return false
      const value = String(formData[field.key] ?? '').trim()
      return !value
    })

    if (invalidField) {
      setError(`${invalidField.label} is required.`)
      setLoading(false)
      return
    }

    const payload = {
      title: formData.title,
      amount: Number(formData.amount),
      description: formData.description,
      urgency: formData.urgency,
    }

    if (Number.isNaN(payload.amount) || payload.amount <= 0) {
      setError('Amount must be a valid positive number.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          title: payload.title,
          amount: payload.amount,
          description: `${payload.description} | Urgency: ${payload.urgency}`,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.message ?? result?.title ?? 'Unable to submit request.')
      }

      setFormData(buildEmptyFormData())
      await fetchRequests(auth.token)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (id, decision) => {
    setLoading(true)
    setError('')

    try {
      const reviewDecision = decision === 'Approved' ? 1 : 2

      const response = await fetch(`${API_BASE_URL}/api/requests/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ decision: reviewDecision }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.title ?? 'Review failed.')
      }

      await fetchRequests(auth.token)
    } catch (reviewError) {
      setError(reviewError.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setAuth(null)
    setError('')
  }

  const canReviewRequests = Array.isArray(auth?.roles) &&
    (auth.roles.includes('Manager') || auth.roles.includes('Finance'))

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">RequestFlow</p>
          <h1>Approval workflow</h1>
        </div>

        {auth && (
          <div className="user-summary">
            <span>{auth.email}</span>
            <span className="roles">{auth.roles.join(', ')}</span>
            <button type="button" onClick={logout} className="secondary-button">
              Logout
            </button>
          </div>
        )}
      </header>

      {!auth ? (
        <section className="panel auth-panel">
          <div className="auth-tabs">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <label>
              Email
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="me@company.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthChange}
                placeholder="••••••••"
                required
              />
            </label>

            {authMode === 'register' && (
              <label>
                Role
                <select name="role" value={authForm.role} onChange={handleAuthChange}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Finance">Finance</option>
                </select>
              </label>
            )}

            {error && <div className="message error">{error}</div>}

            <button type="submit" disabled={loading} className="primary-button">
              {loading ? 'Working...' : authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
        </section>
      ) : (
        <div className="content-grid">
          <section className="panel">
            <h2>New request</h2>
            <form className="dynamic-form" onSubmit={handleCreateRequest}>
              {dynamicSchema.fields.map((field) => (
                <label key={field.key}>
                  {field.label}
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] ?? ''}
                      onChange={(event) => handleFormChange(field.key, event.target.value)}
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] ?? ''}
                      onChange={(event) => handleFormChange(field.key, event.target.value)}
                      required={field.required}
                    >
                      <option value="">Select one</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] ?? ''}
                      onChange={(event) => handleFormChange(field.key, event.target.value)}
                      required={field.required}
                    />
                  )}
                </label>
              ))}

              {error && <div className="message error">{error}</div>}

              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Sending...' : 'Submit request'}
              </button>
            </form>
          </section>

          <section className="panel">
            <h2>Requests</h2>
            {requests.length === 0 ? (
              <p className="empty-state">No requests yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.title}</td>
                        <td>{Number(request.amount).toLocaleString()} تومان</td>
                        <td>
                          <span className={`status ${request.status.toLowerCase()}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>{request.assignedRole}</td>
                        <td>
                          {canReviewRequests && auth.roles.includes(request.assignedRole) ? (
                            request.status === 'Pending' ? (
                              <div className="decision-actions">
                                <button type="button" className="approve" onClick={() => handleReview(request.id, 'Approved')}>
                                  Approve
                                </button>
                                <button type="button" className="reject" onClick={() => handleReview(request.id, 'Rejected')}>
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="readonly">Processed</span>
                            )
                          ) : (
                            <span className="readonly">View only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default App
