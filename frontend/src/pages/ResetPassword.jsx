import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await client.post('/auth/password/reset', { token, newPassword: password })
      setDone(true)
    } catch {
      setError('Invalid or expired reset link.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="card w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold">Invalid Link</h1>
          <p className="text-[#94a8b3] text-sm">This reset link is invalid.</p>
          <Link to="/forgot-password" className="text-indigo-400 hover:underline text-sm block">
            Request a new one
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="card w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold">Password Reset</h1>
          <p className="text-[#94a8b3] text-sm">Your password has been reset successfully.</p>
          <button onClick={() => navigate('/login')} className="bg-indigo-500 hover:bg-indigo-600 py-2.5 px-6 rounded-lg font-medium transition-colors">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-5">
        <h1 className="text-xl font-bold text-center">Set New Password</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm text-[#94a8b3]">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-lg font-medium transition-colors">
          Reset Password
        </button>
      </form>
    </div>
  )
}
