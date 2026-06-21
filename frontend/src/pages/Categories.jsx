import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import client from '../api/client'
import { getCategoryMeta } from '../utils/category'
import { useToast } from '../context/ToastContext'
import ConfirmModal from '../components/ConfirmModal'

const ICONS = ['💰', '🍕', '🏠', '🚗', '🛍️', '💻', '🎬', '📄', '🛒', '💊', '📚', '🎮', '✈️', '🏋️', '🎵', '📺', '☕', '🍺', '🎁', '🔧']

export default function Categories() {
  const { showToast } = useToast()
  const [list, setList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', icon: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetch = () => client.get('/categories').then(r => setList(r.data))

  useEffect(() => { fetch() }, [])

  const openCreate = () => {
    setEditId(null)
    setForm({ name: '', type: 'EXPENSE', icon: ICONS[0] })
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditId(c.uuid)
    setForm({ name: c.name, type: c.type, icon: c.icon || getCategoryMeta(c.name).icon })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editId) {
        await client.put(`/categories/${editId}`, form)
        showToast('Category updated successfully')
      } else {
        await client.post('/categories', form)
        showToast('Category created successfully')
      }
      setShowModal(false)
      fetch()
    } catch {
      showToast('Failed to save category', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await client.delete(`/categories/${deleteTarget}`)
      showToast('Category deleted')
      setDeleteTarget(null)
      fetch()
    } catch {
      showToast('Failed to delete category', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(c => {
            const meta = getCategoryMeta(c.name)
            return (
              <div key={c.uuid} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: meta.color + '20' }}>
                    {c.icon || meta.icon}
                  </span>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className={`text-xs ${c.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{c.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-[#94a3b8] hover:text-white p-1"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteTarget(c.uuid)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card py-12 text-center">
          <p className="text-3xl mb-3">📂</p>
          <p className="text-[#94a3b8] font-medium">No categories yet</p>
          <p className="text-xs text-[#64748b] mt-1">Create income and expense categories to track your money</p>
          <button onClick={openCreate} className="mt-4 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
            <Plus size={14} /> Add Category
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Category"
        message="Are you sure you want to delete this category? Transactions using this category may be affected."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-sm space-y-4 mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-lg">{editId ? 'Edit' : 'Add'} Category</h2>
            <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <div>
              <label className="text-xs text-[#94a3b8]">Icon</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${form.icon === ic ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : 'bg-[#334155] hover:bg-[#475569]'}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
