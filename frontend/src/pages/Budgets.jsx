import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import client from '../api/client'
import { getCategoryMeta, formatCurrency } from '../utils/category'
import { useToast } from '../context/ToastContext'
import ConfirmModal from '../components/ConfirmModal'

export default function Budgets() {
  const { showToast } = useToast()
  const [list, setList] = useState([])
  const [categories, setCategories] = useState([])
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ categoryId: '', limitAmount: '', month: month })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

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
    try {
      if (editId) {
        await client.put(`/budgets/${editId}`, form)
        showToast('Budget updated successfully')
      } else {
        await client.post('/budgets', form)
        showToast('Budget created successfully')
      }
      setShowModal(false)
      fetch()
    } catch {
      showToast('Failed to save budget', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await client.delete(`/budgets/${deleteTarget}`)
      showToast('Budget deleted')
      setDeleteTarget(null)
      fetch()
    } catch {
      showToast('Failed to delete budget', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const percentage = (spent, limit) => {
    if (!limit || Number(limit) === 0) return 0
    return Math.min(Math.round((Number(spent) / Number(limit)) * 100), 100)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <div className="flex gap-3 items-center">
          <input type="month" value={month.slice(0, 7)} onChange={e => setMonth(e.target.value + '-01')} className="w-44" />
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Set Budget
          </button>
        </div>
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(b => {
            const pct = percentage(b.spent, b.limitAmount)
            const meta = getCategoryMeta(b.categoryName)
            return (
              <div key={b.uuid} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: meta.color + '20' }}>
                      {meta.icon}
                    </span>
                    <div>
                      <p className="font-medium">{b.categoryName}</p>
                      <p className="text-sm text-[#94a3b8]">{formatCurrency(b.spent)} / {formatCurrency(b.limitAmount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(b)} className="text-[#94a3b8] hover:text-white p-1"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteTarget(b.uuid)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
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
        </div>
      ) : (
        <div className="card py-12 text-center">
          <p className="text-3xl mb-3">🎯</p>
          <p className="text-[#94a3b8] font-medium">No budgets set for this month</p>
          <p className="text-xs text-[#64748b] mt-1">Set spending limits to track your expenses</p>
          <button onClick={openCreate} className="mt-4 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
            <Plus size={14} /> Set Budget
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Budget"
        message="Are you sure you want to delete this budget?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-sm space-y-4 mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-lg">{editId ? 'Edit' : 'Set'} Budget</h2>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Select category</option>
              {categories.filter(c => c.type === 'EXPENSE').map(c => (
                <option key={c.uuid} value={c.uuid}>{getCategoryMeta(c.name).icon} {c.name}</option>
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
