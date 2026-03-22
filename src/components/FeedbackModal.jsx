import { useState } from 'react'
import { X, ThumbsDown } from 'lucide-react'

const REASON_CATEGORIES = [
  { value: 'generico_educativo', label: 'Conteúdo genérico ou educativo' },
  { value: 'empresa_irrelevante', label: 'Empresa ou pessoa sem relevância para o setor' },
  { value: 'duplicata', label: 'Duplicata de outra notícia' },
  { value: 'fonte_pouco_confivel', label: 'Fonte pouco confiável' },
  { value: 'classificacao_errada', label: 'Classificação errada (categoria ou relevância)' },
  { value: 'outro', label: 'Outro motivo' },
]

export default function FeedbackModal({ item, onConfirm, onCancel }) {
  const [reasonCategory, setReasonCategory] = useState('')
  const [reasonText, setReasonText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    if (!reasonCategory) return
    setSubmitting(true)
    await onConfirm({ reasonCategory, reasonText: reasonText.trim() })
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <ThumbsDown size={14} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-[#063793] font-bold text-sm">Marcar como irrelevante</h2>
              <p className="text-slate-400 text-xs">Seu feedback ajuda a melhorar a classificação automática</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item title preview */}
        <div className="bg-[#F2F5F9] rounded-lg px-3 py-2 border border-[#E2E8F0]">
          <p className="text-slate-600 text-xs line-clamp-2 font-medium">{item.title}</p>
        </div>

        {/* Reason selector */}
        <div>
          <p className="text-slate-600 text-xs font-semibold mb-2">Por que esta notícia é irrelevante? <span className="text-red-400">*</span></p>
          <div className="flex flex-col gap-2">
            {REASON_CATEGORIES.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg border transition-all text-sm ${
                  reasonCategory === r.value
                    ? 'border-[#063793]/40 bg-[#E7ECF5] text-[#063793]'
                    : 'border-[#E2E8F0] bg-white text-slate-600 hover:bg-[#F2F5F9]'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reasonCategory === r.value}
                  onChange={() => setReasonCategory(r.value)}
                  className="accent-[#063793]"
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* Optional text */}
        <div>
          <p className="text-slate-600 text-xs font-semibold mb-1.5">Comentário adicional <span className="text-slate-400">(opcional)</span></p>
          <textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="Ex: Esta notícia é sobre imóveis sem relação com consórcio..."
            rows={2}
            className="w-full text-sm text-slate-600 placeholder-slate-300 border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#063793]/40 resize-none bg-white"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-[#E2E8F0] text-slate-500 text-sm hover:bg-[#F2F5F9] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reasonCategory || submitting}
            className="flex-1 py-2 rounded-lg bg-[#063793] text-white text-sm font-semibold hover:bg-[#063793]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Salvando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
