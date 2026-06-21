import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 md:ml-60 pt-16 md:pt-6">
        <Outlet />
      </main>
    </div>
  )
}
