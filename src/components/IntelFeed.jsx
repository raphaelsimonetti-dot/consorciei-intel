import IntelCard from './IntelCard'
import { Inbox } from 'lucide-react'

function SkeletonCard() {
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 bg-slate-700 rounded-full w-32"></div>
        <div className="h-5 bg-slate-700 rounded-full w-16"></div>
      </div>
      <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-4/5 mb-3"></div>
      <div className="h-3 bg-slate-800 rounded w-full mb-1.5"></div>
      <div className="h-3 bg-slate-800 rounded w-3/4 mb-1.5"></div>
      <div className="h-3 bg-slate-800 rounded w-5/6"></div>
    </div>
  )
}

export default function IntelFeed({ items, loading, error, onUpdate }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-white font-medium mb-2">Erro ao carregar dados</h3>
        <p className="text-slate-400 text-sm max-w-sm">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Inbox size={48} className="text-slate-700 mb-4" />
        <h3 className="text-white font-medium mb-2">Nenhum item encontrado</h3>
        <p className="text-slate-500 text-sm max-w-sm">
          Não há intel registrado para este dia com os filtros selecionados. Tente outro dia ou
          ajuste os filtros.
        </p>
      </div>
    )
  }

  // Separate high relevance items
  const highRelevance = items.filter((i) => i.relevance === 'alta')
  const rest = items.filter((i) => i.relevance !== 'alta')

  return (
    <div>
      {highRelevance.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              🔥 Alta Relevância
            </span>
            <span className="h-px flex-1 bg-red-400/20"></span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {highRelevance.map((item) => (
              <IntelCard key={item.id} item={item} onUpdate={onUpdate} />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          {highRelevance.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Demais itens
              </span>
              <span className="h-px flex-1 bg-[#2a2d3e]"></span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rest.map((item) => (
              <IntelCard key={item.id} item={item} onUpdate={onUpdate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
