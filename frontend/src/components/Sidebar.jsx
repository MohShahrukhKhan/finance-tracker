import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Tags, PiggyBank, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
]

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#1e293b] border-r border-[#334155] p-4 flex flex-col">
      <div className="text-lg font-bold text-indigo-400 mb-8 px-3">Finance Tracker</div>
      <nav className="flex-1 space-y-1">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-[#94a3b8] hover:bg-[#334155] hover:text-white'
              }`
            }
          >
            <l.icon size={18} />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#94a3b8] hover:bg-[#334155] hover:text-white transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  )
}
