import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

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
        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-lg font-medium transition-colors">
          Sign In
        </button>
        <p className="text-sm text-center text-[#94a3b8]">
          No account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}
