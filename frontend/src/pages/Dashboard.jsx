import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import client from '../api/client'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444']

export default function Dashboard() {
  const now = new Date()
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
  const [to, setTo] = useState(now.toISOString().split('T')[0])
  const [year, setYear] = useState(now.getFullYear())
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [breakdown, setBreakdown] = useState([])

  useEffect(() => {
    client.get('/dashboard/summary', { params: { from, to } }).then(r => setSummary(r.data))
    client.get('/dashboard/category-breakdown', { params: { from, to } }).then(r => setBreakdown(r.data))
  }, [from, to])

  useEffect(() => {
    client.get('/dashboard/monthly', { params: { year } }).then(r => setMonthly(r.data))
  }, [year])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3 items-center">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {summary && (
          <>
            <div className="card">
              <p className="text-sm text-[#94a3b8]">Income</p>
              <p className="text-2xl font-bold text-emerald-400">₹{Number(summary.income).toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-sm text-[#94a3b8]">Expense</p>
              <p className="text-2xl font-bold text-red-400">₹{Number(summary.expense).toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-sm text-[#94a3b8]">Balance</p>
              <p className={`text-2xl font-bold ${Number(summary.balance) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ₹{Number(summary.balance).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Monthly Trend</h2>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-24" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, amount }) => `${category}: ₹${Number(amount).toLocaleString()}`}>
                {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
