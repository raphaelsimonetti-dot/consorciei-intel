import { CATEGORIES } from '../lib/constants'

export default function StatsBar({ items, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4 animate-pulse">
            <div className="h-3 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const counts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})

  const newsCount = items.filter((i) => i.source_type === 'news').length
  const ytCount = items.filter((i) => i.source_type === 'youtube').length
  const altaCount = items.filter((i) => i.relevance === 'alta').length

  const stats = [
    { label: 'Total de itens', value: items.length, color: 'text-white', icon: '📊' },
    { label: 'Notícias', value: newsCount, color: 'text-blue-400', icon: '📰' },
    { label: 'YouTube', value: ytCount, color: 'text-red-400', icon: '▶️' },
    { label: 'Alta relevância', value: altaCount, color: 'text-amber-400', icon: '🔥' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4 hover:border-[#3b82f6]/40 transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <span>{stat.icon}</span>
            <span>{stat.label}</span>
          </div>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
