import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-5">
        <h1 className="text-xl font-bold text-center">Create Account</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm text-[#94a3b8]">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-[#94a3b8]">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-[#94a3b8]">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-lg font-medium transition-colors">
          Register
        </button>
        <p className="text-sm text-center text-[#94a3b8]">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  )
}
