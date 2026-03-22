export default function StatsBar({ items, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 animate-pulse shadow-sm">
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-7 bg-slate-100 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const newsCount = items.filter((i) => i.source_type === 'news').length
  const ytCount = items.filter((i) => i.source_type === 'youtube').length
  const altaCount = items.filter((i) => i.relevance === 'alta').length
  const strategicCount = items.filter((i) => i.is_strategic === true).length

  const stats = [
    { label: 'Total de itens', value: items.length, color: 'text-[#063793]', icon: '📊' },
    { label: 'Notícias', value: newsCount, color: 'text-[#063793]', icon: '📰' },
    { label: 'YouTube', value: ytCount, color: 'text-red-500', icon: '▶️' },
    { label: 'Alta relevância', value: altaCount, color: 'text-amber-500', icon: '🔥' },
    { label: 'Estratégicos', value: strategicCount, color: 'text-amber-600', icon: '🎯' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-[#063793]/30 hover:shadow-md transition-all shadow-sm"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <span>{stat.icon}</span>
            <span>{stat.label}</span>
          </div>
          <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
