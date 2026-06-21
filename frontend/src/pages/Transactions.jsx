import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import client from '../api/client'

export default function Transactions() {
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', categoryId: '' })
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ amount: '', note: '', transactionDate: '', categoryId: '' })

  const fetch = () => {
    const params = { page, size: 15, ...filters }
    if (!params.fromDate) delete params.fromDate
    if (!params.toDate) delete params.toDate
    if (!params.categoryId) delete params.categoryId
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <input type="date" value={filters.fromDate} onChange={e => { setFilters(f => ({ ...f, fromDate: e.target.value })); setPage(0) }} className="w-40" placeholder="From" />
        <input type="date" value={filters.toDate} onChange={e => { setFilters(f => ({ ...f, toDate: e.target.value })); setPage(0) }} className="w-40" placeholder="To" />
        <select value={filters.categoryId} onChange={e => { setFilters(f => ({ ...f, categoryId: e.target.value })); setPage(0) }} className="w-48">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.uuid} value={c.uuid}>{c.icon} {c.name}</option>)}
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
            {data.map(t => (
              <tr key={t.uuid} className="border-b border-[#334155] hover:bg-[#334155]/50">
                <td className="p-3">{t.transactionDate}</td>
                <td className="p-3">{t.categoryIcon} {t.categoryName}</td>
                <td className="p-3 text-[#94a3b8]">{t.note || '-'}</td>
                <td className={`p-3 text-right font-medium ${t.categoryType === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.categoryType === 'INCOME' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(t)} className="text-[#94a3b8] hover:text-white mr-2"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(t.uuid)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-[#94a3b8]">No transactions yet</td></tr>
            )}
          </tbody>
        </table>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-lg">{editId ? 'Edit' : 'Add'} Transaction</h2>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.uuid} value={c.uuid}>{c.icon} {c.name}</option>)}
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
