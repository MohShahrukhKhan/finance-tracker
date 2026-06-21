const CATEGORY_MAP = {
  'Salary':     { color: '#22c55e', icon: '💰' },
  'Freelance':  { color: '#8b5cf6', icon: '💻' },
  'Food':       { color: '#10b981', icon: '🍕' },
  'Rent':       { color: '#6366f1', icon: '🏠' },
  'Transport':  { color: '#f59e0b', icon: '🚗' },
  'Shopping':   { color: '#f43f5e', icon: '🛍️' },
  'Groceries':  { color: '#10b981', icon: '🛒' },
  'Entertainment': { color: '#ec4899', icon: '🎬' },
  'Bills':      { color: '#06b6d4', icon: '📄' },
}

export function getCategoryMeta(name) {
  return CATEGORY_MAP[name] || { color: '#64748b', icon: '📁' }
}

export function formatCurrency(value) {
  return '₹' + Number(value).toLocaleString('en-IN')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fillMonthlyTrend(data) {
  return MONTHS.map((month, i) => {
    const found = data.find(d => d.month === month)
    return found || { month, income: 0, expense: 0 }
  })
}
