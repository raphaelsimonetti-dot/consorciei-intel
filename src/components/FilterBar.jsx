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

  const selectClass = "bg-white border border-[#E2E8F0] text-[#333] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#063793]/60 hover:border-[#063793]/40 transition-colors cursor-pointer shadow-sm"

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className={selectClass}
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
        className={selectClass}
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
        className={selectClass}
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
        className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors shadow-sm ${
          filters.strategic
            ? 'text-amber-600 bg-amber-50 border-amber-300 font-semibold'
            : 'text-slate-500 bg-white border-[#E2E8F0] hover:border-amber-300 hover:text-amber-600'
        }`}
      >
        <Target size={13} />
        Estratégicos
      </button>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#063793] px-3 py-2 rounded-lg hover:bg-[#E7ECF5] transition-colors"
        >
          <X size={14} />
          Limpar
        </button>
      )}

      <span className="ml-auto text-xs text-slate-400">
        {hasActiveFilters ? (
          <>
            <span className="text-[#063793] font-semibold">{filteredCount}</span> de {totalItems} itens
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
