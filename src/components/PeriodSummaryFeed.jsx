import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Inbox } from 'lucide-react'
import IntelCard from './IntelCard'

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 animate-pulse shadow-sm">
      <div className="flex gap-2 mb-3">
        <div className="h-5 bg-slate-100 rounded-full w-32"></div>
        <div className="h-5 bg-slate-100 rounded-full w-16"></div>
      </div>
      <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-100 rounded w-4/5 mb-3"></div>
      <div className="h-3 bg-slate-50 rounded w-full mb-1.5"></div>
      <div className="h-3 bg-slate-50 rounded w-3/4 mb-1.5"></div>
      <div className="h-3 bg-slate-50 rounded w-5/6"></div>
    </div>
  )
}

function formatDateLabel(dateStr) {
  try {
    return format(parseISO(dateStr), "EEEE, d 'de' MMMM", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export default function PeriodSummaryFeed({ items, loading, error, days, onUpdate, user }) {
  if (loading) {
    return (
      <div>
        <div className="h-8 bg-white border border-[#E2E8F0] rounded-xl w-64 animate-pulse mb-6 shadow-sm" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-[#063793] font-bold mb-2">Erro ao carregar dados</h3>
        <p className="text-slate-500 text-sm max-w-sm">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Inbox size={48} className="text-slate-300 mb-4" />
        <h3 className="text-[#063793] font-bold mb-2">Nenhum item relevante encontrado</h3>
        <p className="text-slate-400 text-sm max-w-sm">
          Não há intel de alta relevância nos últimos {days} dias.
        </p>
      </div>
    )
  }

  // Group by collected_date
  const groups = {}
  items.forEach((item) => {
    const d = item.collected_date
    if (!groups[d]) groups[d] = []
    groups[d].push(item)
  })
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center gap-3 mb-6 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-500">
          <span className="font-bold text-[#063793]">{items.length} itens relevantes</span>
          {' '}nos últimos {days} dias
        </span>
        <span className="h-4 w-px bg-[#E2E8F0]" />
        <span className="text-sm text-slate-400">
          {sortedDates.length} {sortedDates.length === 1 ? 'dia com dados' : 'dias com dados'}
        </span>
      </div>

      {sortedDates.map((date) => (
        <div key={date} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-[#063793] capitalize whitespace-nowrap">
              {formatDateLabel(date)}
            </span>
            <span className="text-xs text-slate-400 bg-[#E7ECF5] px-2 py-0.5 rounded-full shrink-0">
              {groups[date].length} {groups[date].length === 1 ? 'item' : 'itens'}
            </span>
            <span className="h-px flex-1 bg-[#E2E8F0]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groups[date].map((item) => (
              <IntelCard key={item.id} item={item} onUpdate={onUpdate} user={user} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
