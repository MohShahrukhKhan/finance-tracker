import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import client from '../api/client'
import { getCategoryMeta, formatCurrency } from '../utils/category'

function getQuickDates(key) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
  switch (key) {
    case '7d':   return { from: new Date(y, m, d - 7), to: now }
    case '30d':  return { from: new Date(y, m, d - 30), to: now }
    case 'month': return { from: new Date(y, m, 1), to: now }
    case 'year':  return { from: new Date(y, 0, 1), to: now }
    default:      return { from: null, to: null }
  }
}
function fmt(d) { return d ? d.toISOString().split('T')[0] : '' }

export default function Transactions() {
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [quick, setQuick] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [categoryId, setCatId] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ amount: '', note: '', transactionDate: '', categoryId: '' })

  const filters = useMemo(() => {
    if (quick) {
      const d = getQuickDates(quick)
      return { fromDate: fmt(d.from), toDate: fmt(d.to), categoryId }
    }
    return { fromDate, toDate, categoryId }
  }, [quick, fromDate, toDate, categoryId])

  const fetch = () => {
    const params = { page, size: 15 }
    if (filters.fromDate) params.fromDate = filters.fromDate
    if (filters.toDate) params.toDate = filters.toDate
    if (filters.categoryId) params.categoryId = filters.categoryId
    client.get('/transactions', { params }).then(r => {
      setData(r.data.content)
      setTotalPages(r.data.totalPages)
    })
  }

  useEffect(() => { fetch() }, [page, filters])

  useEffect(() => {
    client.get('/categories').then(r => setCategories(r.data))
  }, [])

  const openCreate = () => {
    setEditId(null)
    setForm({ amount: '', note: '', transactionDate: new Date().toISOString().split('T')[0], categoryId: '' })
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditId(t.uuid)
    setForm({ amount: t.amount, note: t.note || '', transactionDate: t.transactionDate, categoryId: t.categoryUuid })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (editId) await client.put(`/transactions/${editId}`, form)
    else await client.post('/transactions', form)
    setShowModal(false)
    fetch()
  }

  const handleDelete = async (uuid) => {
    await client.delete(`/transactions/${uuid}`)
    fetch()
  }

  const setQuickFilter = (key) => {
    setQuick(key)
    setFromDate('')
    setToDate('')
    setPage(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {[
          { label: '7D', key: '7d' },
          { label: '30D', key: '30d' },
          { label: 'Month', key: 'month' },
          { label: 'Year', key: 'year' },
          { label: 'All', key: '' },
        ].map(p => (
          <button key={p.key} onClick={() => setQuickFilter(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${quick === p.key ? 'bg-indigo-500 text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'}`}>
            {p.label}
          </button>
        ))}
        <div className="h-5 w-px bg-[#334155]" />
        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setQuick(''); setPage(0) }} className="w-36 text-xs" placeholder="From" />
        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setQuick(''); setPage(0) }} className="w-36 text-xs" placeholder="To" />
        <select value={categoryId} onChange={e => { setCatId(e.target.value); setPage(0) }} className="w-40 text-xs">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.uuid} value={c.uuid}>{getCategoryMeta(c.name).icon} {c.name}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155] text-[#94a3b8] text-left">
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Note</th>
              <th className="p-3 font-medium text-right">Amount</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(t => {
              const meta = getCategoryMeta(t.categoryName)
              return (
                <tr key={t.uuid} className="border-b border-[#334155] hover:bg-[#334155]/50">
                  <td className="p-3">{t.transactionDate}</td>
                  <td className="p-3">{meta.icon} {t.categoryName}</td>
                  <td className="p-3 text-[#94a3b8]">{t.note || '-'}</td>
                  <td className={`p-3 text-right font-medium ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(t)} className="text-[#94a3b8] hover:text-white mr-2"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(t.uuid)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-[#94a3b8] font-medium">No transactions found</p>
            <p className="text-xs text-[#64748b] mt-1">Start by adding your first transaction</p>
            <button onClick={openCreate} className="mt-4 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
              <Plus size={14} /> Add Transaction
            </button>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`px-3 py-1 rounded text-sm ${page === i ? 'bg-indigo-500' : 'bg-[#334155] hover:bg-[#475569]'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md space-y-4 mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-lg">{editId ? 'Edit' : 'Add'} Transaction</h2>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.uuid} value={c.uuid}>{getCategoryMeta(c.name).icon} {c.name}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <input type="date" value={form.transactionDate} onChange={e => setForm(f => ({ ...f, transactionDate: e.target.value }))} />
            <input type="text" placeholder="Note (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
