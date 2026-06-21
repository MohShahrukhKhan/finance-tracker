import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import client from '../api/client'

export default function Categories() {
  const [list, setList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', icon: '' })

  const fetch = () => client.get('/categories').then(r => setList(r.data))

  useEffect(() => { fetch() }, [])

  const openCreate = () => {
    setEditId(null)
    setForm({ name: '', type: 'EXPENSE', icon: '' })
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditId(c.uuid)
    setForm({ name: c.name, type: c.type, icon: c.icon || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (editId) await client.put(`/categories/${editId}`, form)
    else await client.post('/categories', form)
    setShowModal(false)
    fetch()
  }

  const handleDelete = async (uuid) => {
    await client.delete(`/categories/${uuid}`)
    fetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {list.map(c => (
          <div key={c.uuid} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{c.icon || '📁'}</span>
              <div>
                <p className="font-medium">{c.name}</p>
                <p className={`text-xs ${c.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{c.type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(c)} className="text-[#94a3b8] hover:text-white p-1"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(c.uuid)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="col-span-2 card text-center text-[#94a3b8]">No categories yet</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-lg">{editId ? 'Edit' : 'Add'} Category</h2>
            <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <input type="text" placeholder="Icon emoji (optional)" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
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
