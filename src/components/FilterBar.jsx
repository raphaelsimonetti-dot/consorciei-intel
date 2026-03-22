import { CATEGORIES, RELEVANCE, SOURCE_TYPES } from '../lib/constants'
import { X, Target } from 'lucide-react'

export default function FilterBar({ filters, onChange, totalItems, filteredCount }) {
  const hasActiveFilters =
    filters.category !== '' ||
    filters.sourceType !== '' ||
    filters.relevance !== '' ||
    filters.strategic === true

  const clearAll = () => {
    onChange({ category: '', sourceType: '', relevance: '', strategic: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="bg-[#1a1d27] border border-[#2a2d3e] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/60 hover:border-[#3b4050] transition-colors cursor-pointer"
      >
        <option value="">Todas as categorias</option>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <option key={key} value={key}>
            {cat.label}
          </option>
        ))}
      </select>

      <select
        value={filters.sourceType}
        onChange={(e) => onChange({ ...filters, sourceType: e.target.value })}
        className="bg-[#1a1d27] border border-[#2a2d3e] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/60 hover:border-[#3b4050] transition-colors cursor-pointer"
      >
        <option value="">Todas as fontes</option>
        {Object.entries(SOURCE_TYPES).map(([key, src]) => (
          <option key={key} value={key}>
            {src.icon} {src.label}
          </option>
        ))}
      </select>

      <select
        value={filters.relevance}
        onChange={(e) => onChange({ ...filters, relevance: e.target.value })}
        className="bg-[#1a1d27] border border-[#2a2d3e] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/60 hover:border-[#3b4050] transition-colors cursor-pointer"
      >
        <option value="">Toda relevância</option>
        {Object.entries(RELEVANCE).map(([key, rel]) => (
          <option key={key} value={key}>
            {rel.label}
          </option>
        ))}
      </select>

      {/* Strategic toggle */}
      <button
        onClick={() => onChange({ ...filters, strategic: !filters.strategic })}
        title="Exibir apenas itens estratégicos"
        className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
          filters.strategic
            ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/40'
            : 'text-slate-400 bg-[#1a1d27] border-[#2a2d3e] hover:border-yellow-400/40 hover:text-yellow-400'
        }`}
      >
        <Target size={13} />
        Estratégicos
      </button>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#21253a] transition-colors"
        >
          <X size={14} />
          Limpar
        </button>
      )}

      <span className="ml-auto text-xs text-slate-500">
        {hasActiveFilters ? (
          <>
            <span className="text-slate-300">{filteredCount}</span> de {totalItems} itens
          </>
        ) : (
          <>
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </>
        )}
      </span>
    </div>
  )
}
