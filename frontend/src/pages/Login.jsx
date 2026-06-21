import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, setToken } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setToken(token)
      navigate('/dashboard', { replace: true })
    }
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-5">
        <h1 className="text-xl font-bold text-center">Sign In</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm text-[#94a3b8]">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-[#94a3b8]">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="flex justify-end -mt-2">
          <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-lg font-medium transition-colors">
          Sign In
        </button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1e293b]"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-[#0f172a] px-2 text-[#475569]">or</span></div>
        </div>
        <a href="/oauth2/authorization/github"
           className="flex items-center justify-center gap-2 w-full border border-[#1e293b] hover:bg-[#1e293b] py-2.5 rounded-lg font-medium transition-colors text-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>
          Sign in with GitHub
        </a>
        <p className="text-sm text-center text-[#94a3b8]">
          No account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}
