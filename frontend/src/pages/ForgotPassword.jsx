import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await client.post('/auth/password/forgot', { email })
      setSent(true)
    } catch {
      setError('Something went wrong. Try again.')
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="card w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold">Check Your Email</h1>
          <p className="text-[#94a8b3] text-sm">
            If an account with that email exists, we've sent a password reset link.
          </p>
          <Link to="/login" className="text-indigo-400 hover:underline text-sm block">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-5">
        <h1 className="text-xl font-bold text-center">Forgot Password</h1>
        <p className="text-sm text-[#94a8b3] text-center">
          Enter your email to receive a reset link.
        </p>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm text-[#94a8b3]">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-lg font-medium transition-colors">
          Send Reset Link
        </button>
        <p className="text-sm text-center text-[#94a8b3]">
          Remember it? <Link to="/login" className="text-indigo-400 hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  )
}
