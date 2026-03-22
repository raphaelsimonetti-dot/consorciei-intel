import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ThumbsDown, User, Calendar, ExternalLink, RefreshCw } from 'lucide-react'

const REASON_LABELS = {
  generico_educativo:   'Conteúdo genérico/educativo',
  empresa_irrelevante:  'Empresa sem relevância',
  duplicata:            'Duplicata',
  fonte_pouco_confivel: 'Fonte pouco confiável',
  classificacao_errada: 'Classificação errada',
  outro:                'Outro',
}

const REASON_COLORS = {
  generico_educativo:   'bg-blue-50 text-blue-600 border-blue-200',
  empresa_irrelevante:  'bg-slate-50 text-slate-600 border-slate-200',
  duplicata:            'bg-amber-50 text-amber-600 border-amber-200',
  fonte_pouco_confivel: 'bg-orange-50 text-orange-600 border-orange-200',
  classificacao_errada: 'bg-purple-50 text-purple-600 border-purple-200',
  outro:                'bg-gray-50 text-gray-600 border-gray-200',
}

export default function AvaliacoesView() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterReason, setFilterReason] = useState('')

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  async function fetchFeedbacks() {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('intel_feedback')
        .select('*')
        .eq('action', 'irrelevant')
        .order('created_at', { ascending: false })
        .limit(200)

      const { data, error: err } = await query
      if (err) throw err
      setFeedbacks(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Stats
  const reasonStats = feedbacks.reduce((acc, f) => {
    const key = f.reason_category || 'outro'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const sourceStats = feedbacks.reduce((acc, f) => {
    const key = f.item_source || 'Desconhecido'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const topSources = Object.entries(sourceStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const filtered = filterReason
    ? feedbacks.filter((f) => f.reason_category === filterReason)
    : feedbacks

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <RefreshCw size={20} className="animate-spin mr-2" />
        Carregando avaliações…
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-400 text-sm">
        Erro ao carregar: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
          <p className="text-xs text-slate-400 mb-1">Total de avaliações</p>
          <p className="text-2xl font-black text-[#063793]">{feedbacks.length}</p>
        </div>

        {Object.entries(reasonStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([key, count]) => (
            <div key={key} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
              <p className="text-xs text-slate-400 mb-1 truncate">{REASON_LABELS[key] || key}</p>
              <p className="text-2xl font-black text-amber-500">{count}</p>
            </div>
          ))}
      </div>

      {/* Top flagged sources */}
      {topSources.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Fontes mais sinalizadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {topSources.map(([source, count]) => (
              <span
                key={source}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200"
              >
                {source}
                <span className="font-bold">{count}×</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter + refresh */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterReason}
          onChange={(e) => setFilterReason(e.target.value)}
          className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-[#063793]/40"
        >
          <option value="">Todos os motivos</option>
          {Object.entries(REASON_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <button
          onClick={fetchFeedbacks}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#063793] px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F2F5F9] transition-colors"
        >
          <RefreshCw size={12} />
          Atualizar
        </button>

        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} {filtered.length === 1 ? 'avaliação' : 'avaliações'}
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          <ThumbsDown size={32} className="mx-auto mb-3 opacity-30" />
          Nenhuma avaliação de irrelevância registrada.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start gap-2 mb-2">
                {/* Reason badge */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    REASON_COLORS[f.reason_category] || REASON_COLORS.outro
                  }`}
                >
                  {REASON_LABELS[f.reason_category] || f.reason_category || 'Sem motivo'}
                </span>

                {/* Source */}
                {f.item_source && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F2F5F9] text-slate-500 border border-[#E2E8F0]">
                    {f.item_source}
                  </span>
                )}

                {/* Category */}
                {f.item_category && (
                  <span className="text-xs text-slate-400 ml-auto">
                    {f.item_category.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              {/* Title */}
              <p className="text-[#063793] font-semibold text-sm mb-1 leading-snug">
                {f.item_url ? (
                  <a
                    href={f.item_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1"
                  >
                    {f.item_title}
                    <ExternalLink size={11} className="opacity-50" />
                  </a>
                ) : (
                  f.item_title
                )}
              </p>

              {/* Optional comment */}
              {f.reason_text && (
                <p className="text-slate-400 text-xs italic mb-2">"{f.reason_text}"</p>
              )}

              {/* Footer */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-2 border-t border-[#F2F5F9]">
                <span className="flex items-center gap-1">
                  <User size={11} />
                  {f.user_name || f.user_email || 'Anônimo'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {f.collected_date
                    ? format(parseISO(f.collected_date), "d 'de' MMMM", { locale: ptBR })
                    : '—'}
                </span>
                <span className="ml-auto">
                  {f.created_at
                    ? format(parseISO(f.created_at), "d MMM, HH:mm", { locale: ptBR })
                    : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
