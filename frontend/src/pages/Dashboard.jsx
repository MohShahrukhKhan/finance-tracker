import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import client from '../api/client'
import { getCategoryMeta, formatCurrency, fillMonthlyTrend } from '../utils/category'

function Skeleton() {
  return <div className="card animate-pulse space-y-3"><div className="h-4 bg-[#334155] rounded w-1/3" /><div className="h-8 bg-[#334155] rounded w-1/2" /><div className="h-3 bg-[#334155] rounded w-1/4" /></div>
}

function ChartSkeleton() {
  return <div className="card animate-pulse"><div className="h-4 bg-[#334155] rounded w-1/4 mb-4" /><div className="h-[300px] bg-[#334155] rounded" /></div>
}

function getPeriodDates(period) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
  switch (period) {
    case '7d': return { from: new Date(y, m, d - 7), to: now }
    case '30d': return { from: new Date(y, m, d - 30), to: now }
    case 'month': return { from: new Date(y, m, 1), to: now }
    case 'year': return { from: new Date(y, 0, 1), to: now }
    default: return { from: new Date(y, m, 1), to: now }
  }
}

function fmt(d) { return d.toISOString().split('T')[0] }

export default function Dashboard() {
  const now = new Date()
  const [period, setPeriod] = useState('month')
  const [year, setYear] = useState(now.getFullYear())
  const [summary, setSummary] = useState(null)
  const [prevSummary, setPrevSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [recent, setRecent] = useState([])

  const dates = useMemo(() => getPeriodDates(period), [period])
  const datesArr = useMemo(() => [dates.from, dates.to], [dates])

  function getPrevPeriod(from, to) {
    const diff = to.getTime() - from.getTime()
    const prevFrom = new Date(from.getTime() - diff)
    const prevTo = new Date(to.getTime() - diff)
    return { from: prevFrom, to: prevTo }
  }

  useEffect(() => {
    const [from, to] = datesArr
    const prev = getPrevPeriod(from, to)
    client.get('/dashboard/summary', { params: { from: fmt(from), to: fmt(to) } }).then(r => setSummary(r.data))
    client.get('/dashboard/summary', { params: { from: fmt(prev.from), to: fmt(prev.to) } }).then(r => setPrevSummary(r.data))
    client.get('/dashboard/category-breakdown', { params: { from: fmt(from), to: fmt(to) } }).then(r => setBreakdown(r.data))
    client.get('/transactions', { params: { page: 0, size: 5, sortBy: 'transactionDate', sortDirection: 'desc' } }).then(r => setRecent(r.data.content))
  }, [datesArr[0].getTime(), datesArr[1].getTime()])

  useEffect(() => {
    client.get('/dashboard/monthly', { params: { year } }).then(r => setMonthly(r.data))
  }, [year])

  const chartData = useMemo(() => fillMonthlyTrend(monthly), [monthly])

  const savingsRate = summary && Number(summary.income) > 0
    ? Math.round((1 - Number(summary.expense) / Number(summary.income)) * 100)
    : 0

  const savingsLabel = savingsRate >= 50 ? 'Excellent' : savingsRate >= 30 ? 'Good' : savingsRate >= 15 ? 'Fair' : 'Low'
  const savingsColor = savingsRate >= 50 ? 'text-emerald-400' : savingsRate >= 30 ? 'text-indigo-400' : savingsRate >= 15 ? 'text-amber-400' : 'text-red-400'

  const prevIncome = prevSummary ? Number(prevSummary.income) : 0
  const prevExpense = prevSummary ? Number(prevSummary.expense) : 0
  const currIncome = summary ? Number(summary.income) : 0
  const currExpense = summary ? Number(summary.expense) : 0
  const incomeChange = prevIncome > 0 ? Math.round(((currIncome - prevIncome) / prevIncome) * 100) : null
  const expenseChange = prevExpense > 0 ? Math.round(((currExpense - prevExpense) / prevExpense) * 100) : null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Shahrukh 👋</h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Your overview for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: '7D', key: '7d' },
            { label: '30D', key: '30d' },
            { label: 'Month', key: 'month' },
            { label: 'Year', key: 'year' },
          ].map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p.key ? 'bg-indigo-500 text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'}`}>
              {p.label}
            </button>
          ))}
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="date" value={fmt(dates.from)} onChange={e => { setPeriod('custom'); /* handled via dates */ }} className="flex-1 min-w-0 text-xs" />
            <span className="text-[#64748b] text-xs self-center">–</span>
            <input type="date" value={fmt(dates.to)} onChange={e => setPeriod('custom')} className="flex-1 min-w-0 text-xs" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary ? (
          <>
            <div className="card">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Income</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(currIncome)}</p>
              {incomeChange !== null && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${incomeChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange)}% vs previous period
                </p>
              )}
            </div>
            <div className="card">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Expense</p>
              <p className="text-xl font-bold text-red-400 mt-1">{formatCurrency(currExpense)}</p>
              {expenseChange !== null && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${expenseChange <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {expenseChange <= 0 ? '↓' : '↑'} {Math.abs(expenseChange)}% vs previous period
                </p>
              )}
            </div>
            <div className="card">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Savings Rate</p>
              <p className="text-xl font-bold text-indigo-400 mt-1">{savingsRate}%
                <span className={`text-sm font-medium ml-2 ${savingsColor}`}>{savingsLabel}</span>
              </p>
              <p className="text-xs text-[#94a3b8] mt-1">of income saved</p>
            </div>
            <div className="card">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Balance</p>
              <p className={`text-xl font-bold mt-1 ${Number(summary.balance) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(summary.balance)}
              </p>
              <p className="text-xs text-[#94a3b8] mt-1">net position</p>
            </div>
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        )}
      </div>

      {summary && Number(summary.income) === 0 && Number(summary.expense) === 0 && (
        <div className="card bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20">
          <div className="flex items-start gap-4">
            <span className="text-3xl">👋</span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Welcome to Finance Tracker!</h2>
              <p className="text-sm text-[#94a3b8] mb-4">Get started with these steps:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 bg-[#1e293b]/50 rounded-lg p-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <p className="text-sm">Create income & expense categories</p>
                </div>
                <div className="flex items-center gap-3 bg-[#1e293b]/50 rounded-lg p-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <p className="text-sm">Add your first transaction</p>
                </div>
                <div className="flex items-center gap-3 bg-[#1e293b]/50 rounded-lg p-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  <p className="text-sm">Set monthly budgets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Monthly Trend</h2>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-20 text-sm" />
          </div>
          {monthly.length > 0 || chartData.some(d => d.income > 0 || d.expense > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value) => [formatCurrency(value), undefined]}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
                />
                <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#94a3b8] text-sm">
              No transaction data for {year}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Expense Breakdown</h2>
          {breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} innerRadius={55}
                  label={({ category, amount }) => `${category}: ${formatCurrency(amount)}`}>
                  {breakdown.map((entry, i) => (
                    <Cell key={i} fill={getCategoryMeta(entry.category).color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#94a3b8] text-sm">
              No expenses in this period
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-4">Recent Transactions</h2>
          {recent.length > 0 ? (
            <div className="space-y-1">
              {recent.map(t => {
                const meta = getCategoryMeta(t.categoryName)
                return (
                  <div key={t.uuid} className="flex items-center justify-between py-2.5 border-b border-[#1e293b] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{meta.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{t.categoryName}</p>
                        <p className="text-xs text-[#94a3b8]">{t.note || t.transactionDate}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#94a3b8] text-sm">
              <p className="text-2xl mb-2">📭</p>
              <p>No transactions yet</p>
              <p className="text-xs mt-1">Start by adding your first transaction</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Top Categories</h2>
          {breakdown.length > 0 ? (
            <div className="space-y-3">
              {breakdown.map((entry, i) => {
                const meta = getCategoryMeta(entry.category)
                const pct = summary ? Math.round((Number(entry.amount) / Number(summary.expense)) * 100) : 0
                return (
                  <div key={entry.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: meta.color + '30', color: meta.color }}>
                          {i + 1}
                        </span>
                        <span className="flex items-center gap-1">{meta.icon} {entry.category}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(entry.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#94a3b8] text-sm">
              <p className="text-2xl mb-2">📊</p>
              <p>No spending data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
