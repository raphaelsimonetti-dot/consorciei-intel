import { useState } from 'react'
import { CATEGORIES, RELEVANCE } from '../lib/constants'
import {
  ExternalLink,
  Youtube,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Send,
  X,
  Target,
  Trash2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { updateUserRelevance, updateTags, markSlackShared, saveFeedback, deleteItem, updateItemRelevance } from '../lib/actions'
import FeedbackModal from './FeedbackModal'

const STRATEGIC_LABELS = {
  parceria: 'Parceria',
  ma: 'M&A',
  inovacao: 'Inovação',
  regulatorio: 'Regulatório',
  pessoas: 'Pessoas-chave',
}

const ADMIN_EMAIL = 'raphael.simonetti@consorciei.com.br'

export default function IntelCard({ item, onUpdate, onRemove, user }) {
  const [localItem, setLocalItem] = useState(item)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [saving, setSaving] = useState(null) // 'relevance' | 'slack' | 'delete' | 'relevance_change'
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const isAdmin = user?.email === ADMIN_EMAIL

  const category = CATEGORIES[localItem.category] || {
    label: localItem.category,
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/30',
    dot: 'bg-slate-400',
  }
  const relevance = RELEVANCE[localItem.relevance]
  const isYouTube = localItem.source_type === 'youtube'
  const isHighRelevance = localItem.relevance === 'alta'

  const tags = Array.isArray(localItem.tags)
    ? localItem.tags
    : typeof localItem.tags === 'string'
    ? JSON.parse(localItem.tags || '[]')
    : []

  const keyTopics = Array.isArray(localItem.key_topics)
    ? localItem.key_topics
    : typeof localItem.key_topics === 'string'
    ? JSON.parse(localItem.key_topics || '[]')
    : []

  const publishedDate = localItem.published_date
    ? format(parseISO(localItem.published_date), 'd MMM', { locale: ptBR })
    : null

  const itemUrl =
    localItem.url ||
    (isYouTube && localItem.video_id
      ? `https://youtube.com/watch?v=${localItem.video_id}`
      : null)

  // --- Actions ---

  async function handleThumbsUp() {
    const newValue = localItem.user_relevance === true ? null : true
    setSaving('relevance')
    const updates = {
      user_relevance: newValue,
      user_relevance_at: newValue !== null ? new Date().toISOString() : null,
    }
    setLocalItem((prev) => ({ ...prev, ...updates }))
    onUpdate?.(localItem.id, updates)
    await updateUserRelevance(localItem.id, newValue)
    if (newValue === true) {
      await saveFeedback({
        collected_date: localItem.collected_date,
        item_title: localItem.title,
        item_url: localItem.url || null,
        item_source: localItem.source_name || null,
        item_category: localItem.category || null,
        source_type: localItem.source_type || null,
        action: 'relevant',
        user_email: user?.email || null,
        user_name: user?.user_metadata?.full_name || null,
        user_avatar: user?.user_metadata?.avatar_url || null,
      })
    }
    setSaving(null)
  }

  async function handleThumbsDown() {
    // If already marked irrelevant, toggle off without modal
    if (localItem.user_relevance === false) {
      setSaving('relevance')
      const updates = { user_relevance: null, user_relevance_at: null }
      setLocalItem((prev) => ({ ...prev, ...updates }))
      onUpdate?.(localItem.id, updates)
      await updateUserRelevance(localItem.id, null)
      setSaving(null)
      return
    }
    // Otherwise open modal for reason
    setShowFeedbackModal(true)
  }

  async function handleFeedbackConfirm({ reasonCategory, reasonText }) {
    setShowFeedbackModal(false)
    setSaving('relevance')
    const updates = {
      user_relevance: false,
      user_relevance_at: new Date().toISOString(),
    }
    setLocalItem((prev) => ({ ...prev, ...updates }))
    onUpdate?.(localItem.id, updates)
    await updateUserRelevance(localItem.id, false)
    await saveFeedback({
      collected_date: localItem.collected_date,
      item_title: localItem.title,
      item_url: localItem.url || null,
      item_source: localItem.source_name || null,
      item_category: localItem.category || null,
      source_type: localItem.source_type || null,
      action: 'irrelevant',
      reason_category: reasonCategory,
      reason_text: reasonText || null,
      user_email: user?.email || null,
      user_name: user?.user_metadata?.full_name || null,
      user_avatar: user?.user_metadata?.avatar_url || null,
    })
    setSaving(null)
  }

  async function handleRemoveTag(tagToRemove) {
    const oldTags = [...tags]
    const newTags = tags.filter((t) => t !== tagToRemove)
    setLocalItem((prev) => ({ ...prev, tags: newTags }))
    onUpdate?.(localItem.id, { tags: newTags })
    await updateTags(localItem.id, newTags, oldTags)
  }

  async function handleAddTag() {
    const trimmed = newTagInput.trim().replace(/^#/, '')
    if (!trimmed || tags.includes(trimmed)) {
      setNewTagInput('')
      return
    }
    const oldTags = [...tags]
    const newTags = [...tags, trimmed]
    setLocalItem((prev) => ({ ...prev, tags: newTags }))
    setNewTagInput('')
    onUpdate?.(localItem.id, { tags: newTags })
    await updateTags(localItem.id, newTags, oldTags)
  }

  async function handleShareSlack() {
    if (localItem.slack_shared) return
    setSaving('slack')
    const webhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL
    if (webhookUrl) {
      try {
        const relevanceEmoji = localItem.relevance === 'alta' ? '🔥' : localItem.relevance === 'média' ? '🟡' : '⚪'
        const text =
          `*${localItem.title}*\n` +
          `📂 ${category.label}  |  ${relevanceEmoji} Relevância ${localItem.relevance || 'n/d'}\n` +
          `📰 ${localItem.source_name || 'Fonte'}  |  📅 ${publishedDate || ''}\n\n` +
          `${localItem.summary || ''}\n\n` +
          `🔗 ${itemUrl || ''}`
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
      } catch (e) {
        console.error('Slack webhook error:', e)
      }
    } else {
      const text = `${localItem.title}\n\n${localItem.summary || ''}\n\n${itemUrl || ''}`
      try { navigator.clipboard.writeText(text) } catch (_) {}
    }
    const updates = { slack_shared: true, slack_shared_at: new Date().toISOString() }
    setLocalItem((prev) => ({ ...prev, ...updates }))
    onUpdate?.(localItem.id, { slack_shared: true })
    await markSlackShared(localItem.id)
    setSaving(null)
  }

  async function handleDelete() {
    if (!window.confirm('Excluir esta notícia?')) return
    setSaving('delete')
    await deleteItem(localItem.id)
    onRemove?.(localItem.id)
    setSaving(null)
  }

  async function handleRelevanceChange(newRelevance) {
    if (newRelevance === localItem.relevance) return
    setSaving('relevance_change')
    const updates = { relevance: newRelevance }
    setLocalItem((prev) => ({ ...prev, ...updates }))
    onUpdate?.(localItem.id, updates)
    await updateItemRelevance(localItem.id, newRelevance)
    setSaving(null)
  }

  return (
    <>
      {showFeedbackModal && (
        <FeedbackModal
          item={localItem}
          onConfirm={handleFeedbackConfirm}
          onCancel={() => setShowFeedbackModal(false)}
        />
      )}

      <article
        className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all group flex flex-col shadow-sm ${
          isHighRelevance ? 'border-amber-300' : 'border-[#E2E8F0]'
        } ${localItem.user_relevance === false ? 'opacity-60' : ''}`}
      >
        {/* Top row: category + relevance + strategic + source */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${category.bg} ${category.color} ${category.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${category.dot}`}></span>
            {category.label}
          </span>

          {relevance && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${relevance.bg} ${relevance.color} ${relevance.border}`}
            >
              {relevance.label}
            </span>
          )}

          {localItem.is_strategic && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-semibold">
              <Target size={10} />
              {STRATEGIC_LABELS[localItem.strategic_category] || 'Estratégico'}
            </span>
          )}

          <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
            {isYouTube ? (
              <>
                <Youtube size={12} className="text-red-500" />
                <span className="text-red-500">YouTube</span>
              </>
            ) : (
              <>
                <span>📰</span>
                <span>{localItem.source_name || 'Notícia'}</span>
              </>
            )}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[#063793] font-bold text-sm sm:text-base leading-snug mb-2 group-hover:text-[#063793]/80 transition-colors">
          {itemUrl ? (
            <a href={itemUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {localItem.title}
            </a>
          ) : (
            localItem.title
          )}
        </h3>

        {/* Summary */}
        {localItem.summary && (
          <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-3">
            {localItem.summary}
          </p>
        )}

        {/* YouTube-specific */}
        {isYouTube && (
          <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-slate-400">
            {localItem.channel_name && (
              <span className="text-slate-500">📺 {localItem.channel_name}</span>
            )}
            {localItem.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {localItem.duration_minutes} min
              </span>
            )}
            {localItem.video_id && (
              <a
                href={`https://youtube.com/watch?v=${localItem.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors font-semibold"
              >
                <ExternalLink size={11} />
                Assistir
              </a>
            )}
          </div>
        )}

        {/* Key topics */}
        {keyTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {keyTopics.slice(0, 4).map((topic, i) => (
              <span
                key={i}
                className="text-xs bg-[#E7ECF5] text-[#063793] px-2 py-0.5 rounded-md border border-[#063793]/10"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Tags (editable) */}
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs bg-[#F2F5F9] text-slate-500 px-2 py-0.5 rounded-md border border-[#E2E8F0] hover:bg-[#E7ECF5] transition-colors"
            >
              #{tag}
              {isEditingTags && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}

          {isEditingTags && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag()
                  if (e.key === 'Escape') setIsEditingTags(false)
                }}
                placeholder="nova tag"
                autoFocus
                className="text-xs bg-white text-slate-600 placeholder-slate-300 border border-[#E2E8F0] rounded-md px-2 py-0.5 w-24 focus:outline-none focus:border-[#063793]/40"
              />
              <button
                onClick={handleAddTag}
                className="text-xs text-[#063793] hover:text-[#063793]/70 px-1 font-bold"
              >
                +
              </button>
            </div>
          )}

          <button
            onClick={() => setIsEditingTags((v) => !v)}
            className={`text-xs px-1.5 py-0.5 rounded-md transition-colors ${
              isEditingTags
                ? 'text-[#063793] bg-[#E7ECF5]'
                : 'text-slate-300 hover:text-slate-500 hover:bg-[#F2F5F9]'
            }`}
            title="Editar tags"
          >
            {isEditingTags ? '✓ feito' : '# editar'}
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: date + action buttons */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E2E8F0]">
          <span className="text-xs text-slate-400">
            {publishedDate ||
              (localItem.collected_date
                ? format(parseISO(localItem.collected_date), 'd MMM', { locale: ptBR })
                : '')}
          </span>

          <div className="flex items-center gap-0.5">
            {/* Thumbs up — relevante */}
            <button
              onClick={handleThumbsUp}
              disabled={saving === 'relevance'}
              title="Relevante"
              className={`p-1.5 rounded-lg transition-colors ${
                localItem.user_relevance === true
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <ThumbsUp size={13} />
            </button>

            {/* Thumbs down — irrelevante (abre modal) */}
            <button
              onClick={handleThumbsDown}
              disabled={saving === 'relevance'}
              title={localItem.user_relevance === false ? 'Remover avaliação' : 'Marcar como irrelevante'}
              className={`p-1.5 rounded-lg transition-colors ${
                localItem.user_relevance === false
                  ? 'text-red-500 bg-red-50'
                  : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <ThumbsDown size={13} />
            </button>

            {/* Slack share */}
            <button
              onClick={handleShareSlack}
              disabled={localItem.slack_shared || saving === 'slack'}
              title={localItem.slack_shared ? 'Já copiado' : 'Copiar / Compartilhar'}
              className={`p-1.5 rounded-lg transition-colors ${
                localItem.slack_shared
                  ? 'text-emerald-600 bg-emerald-50 cursor-default'
                  : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Send size={13} />
            </button>

            {/* External link (news only) */}
            {itemUrl && !isYouTube && (
              <a
                href={itemUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir fonte"
                className="p-1.5 rounded-lg text-slate-300 hover:text-[#063793] hover:bg-[#E7ECF5] transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            )}

            {/* Admin controls */}
            {isAdmin && (
              <>
                <div className="w-px h-4 bg-[#E2E8F0] mx-1" />

                {/* Relevance selector */}
                <select
                  value={localItem.relevance || ''}
                  onChange={(e) => handleRelevanceChange(e.target.value)}
                  disabled={saving === 'relevance_change'}
                  title="Mudar relevância"
                  className="text-xs text-slate-400 border border-[#E2E8F0] rounded-lg px-1.5 py-1 bg-white hover:border-[#063793]/30 focus:outline-none focus:border-[#063793]/50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <option value="alta">Alta</option>
                  <option value="média">Média</option>
                  <option value="baixa">Baixa</option>
                </select>

                {/* Delete */}
                <button
                  onClick={handleDelete}
                  disabled={saving === 'delete'}
                  title="Excluir notícia"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    </>
  )
}
