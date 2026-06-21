import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import client from '../api/client'

export default function Budgets() {
  const [list, setList] = useState([])
  const [categories, setCategories] = useState([])
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ categoryId: '', limitAmount: '', month: month })

  const fetch = () => {
    client.get('/budgets', { params: { month } }).then(r => setList(r.data))
  }

  useEffect(() => { fetch() }, [month])

  useEffect(() => {
    client.get('/categories').then(r => setCategories(r.data))
  }, [])

  const openCreate = () => {
    setEditId(null)
    setForm({ categoryId: '', limitAmount: '', month })
    setShowModal(true)
  }

  const openEdit = (b) => {
    setEditId(b.uuid)
    setForm({ categoryId: b.categoryUuid, limitAmount: b.limitAmount, month })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (editId) await client.put(`/budgets/${editId}`, form)
    else await client.post('/budgets', form)
    setShowModal(false)
    fetch()
  }

  const handleDelete = async (uuid) => {
    await client.delete(`/budgets/${uuid}`)
    fetch()
  }

  const percentage = (spent, limit) => {
    if (!limit || Number(limit) === 0) return 0
    return Math.min(Math.round((Number(spent) / Number(limit)) * 100), 100)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <div className="flex gap-3 items-center">
          <input type="month" value={month.slice(0, 7)} onChange={e => setMonth(e.target.value + '-01')} className="w-44" />
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Set Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {list.map(b => {
          const pct = percentage(b.spent, b.limitAmount)
          return (
            <div key={b.uuid} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{b.categoryName}</p>
                  <p className="text-sm text-[#94a3b8]">₹{Number(b.spent).toLocaleString()} / ₹{Number(b.limitAmount).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="text-[#94a3b8] hover:text-white p-1"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(b.uuid)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`text-xs mt-1 ${pct >= 90 ? 'text-red-400' : pct >= 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pct}% used
              </p>
            </div>
          )
        })}
        {list.length === 0 && (
          <div className="col-span-2 card text-center text-[#94a3b8]">No budgets set for this month</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-lg">{editId ? 'Edit' : 'Set'} Budget</h2>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Select category</option>
              {categories.filter(c => c.type === 'EXPENSE').map(c => (
                <option key={c.uuid} value={c.uuid}>{c.icon} {c.name}</option>
              ))}
            </select>
            <input type="number" step="0.01" placeholder="Monthly limit" value={form.limitAmount} onChange={e => setForm(f => ({ ...f, limitAmount: e.target.value }))} />
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
