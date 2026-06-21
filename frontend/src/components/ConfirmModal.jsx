import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Delete', loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="card max-w-sm w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle size={20} />
          </span>
          <h2 className="font-semibold text-lg">{title}</h2>
        </div>
        <p className="text-sm text-[#94a3b8] leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-sm transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2">
            {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
