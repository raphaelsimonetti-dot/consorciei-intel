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
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { updateUserRelevance, updateTags, markSlackShared } from '../lib/actions'

const STRATEGIC_LABELS = {
  parceria: 'Parceria',
  ma: 'M&A',
  inovacao: 'Inovação',
  regulatorio: 'Regulatório',
  pessoas: 'Pessoas-chave',
}

export default function IntelCard({ item, onUpdate }) {
  const [localItem, setLocalItem] = useState(item)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [saving, setSaving] = useState(null) // 'relevance' | 'slack'

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

  // YouTube fix: use video_id to build URL if url is missing/empty
  const itemUrl =
    localItem.url ||
    (isYouTube && localItem.video_id
      ? `https://youtube.com/watch?v=${localItem.video_id}`
      : null)

  // --- Actions ---

  async function handleRelevance(value) {
    const newValue = localItem.user_relevance === value ? null : value
    setSaving('relevance')
    const updates = {
      user_relevance: newValue,
      user_relevance_at: newValue !== null ? new Date().toISOString() : null,
    }
    setLocalItem((prev) => ({ ...prev, ...updates }))
    onUpdate?.(localItem.id, updates)
    await updateUserRelevance(localItem.id, newValue)
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
      // Fallback: copy formatted text to clipboard
      const text = `${localItem.title}\n\n${localItem.summary || ''}\n\n${itemUrl || ''}`
      try { navigator.clipboard.writeText(text) } catch (_) {}
    }
    const updates = { slack_shared: true, slack_shared_at: new Date().toISOString() }
    setLocalItem((prev) => ({ ...prev, ...updates }))
    onUpdate?.(localItem.id, { slack_shared: true })
    await markSlackShared(localItem.id)
    setSaving(null)
  }

  return (
    <article
      className={`bg-[#1a1d27] border rounded-xl p-4 hover:border-[#3b82f6]/40 transition-all group flex flex-col ${
        isHighRelevance ? 'border-red-400/30' : 'border-[#2a2d3e]'
      }`}
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
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
            <Target size={10} />
            {STRATEGIC_LABELS[localItem.strategic_category] || 'Estratégico'}
          </span>
        )}

        <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
          {isYouTube ? (
            <>
              <Youtube size={12} className="text-red-400" />
              <span className="text-red-400/80">YouTube</span>
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
      <h3 className="text-white font-medium text-sm sm:text-base leading-snug mb-2 group-hover:text-blue-300 transition-colors">
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
        <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-3">
          {localItem.summary}
        </p>
      )}

      {/* YouTube-specific: channel + duration + watch link */}
      {isYouTube && (
        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-slate-500">
          {localItem.channel_name && (
            <span className="text-slate-400">📺 {localItem.channel_name}</span>
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
              className="flex items-center gap-1 text-red-400/80 hover:text-red-400 transition-colors"
            >
              <ExternalLink size={11} />
              Assistir
            </a>
          )}
        </div>
      )}

      {/* Key topics (YouTube) */}
      {keyTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {keyTopics.slice(0, 4).map((topic, i) => (
            <span
              key={i}
              className="text-xs bg-[#21253a] text-slate-400 px-2 py-0.5 rounded-md border border-[#2a2d3e]"
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
            className="inline-flex items-center gap-1 text-xs bg-[#21253a] text-slate-500 px-2 py-0.5 rounded-md hover:bg-[#2a2d3e] transition-colors"
          >
            #{tag}
            {isEditingTags && (
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-slate-600 hover:text-red-400 transition-colors ml-0.5"
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
              className="text-xs bg-[#21253a] text-slate-300 placeholder-slate-600 border border-[#3b4050] rounded-md px-2 py-0.5 w-24 focus:outline-none focus:border-blue-500/60"
            />
            <button
              onClick={handleAddTag}
              className="text-xs text-blue-400 hover:text-blue-300 px-1 font-bold"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={() => setIsEditingTags((v) => !v)}
          className={`text-xs px-1.5 py-0.5 rounded-md transition-colors ${
            isEditingTags
              ? 'text-blue-400 bg-blue-400/10'
              : 'text-slate-700 hover:text-slate-400 hover:bg-[#21253a]'
          }`}
          title="Editar tags"
        >
          {isEditingTags ? '✓ feito' : '# editar'}
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer: date + action buttons */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2d3e]">
        <span className="text-xs text-slate-600">
          {publishedDate ||
            (localItem.collected_date
              ? format(parseISO(localItem.collected_date), 'd MMM', { locale: ptBR })
              : '')}
        </span>

        <div className="flex items-center gap-0.5">
          {/* Thumbs up — relevante */}
          <button
            onClick={() => handleRelevance(true)}
            disabled={saving === 'relevance'}
            title="Relevante"
            className={`p-1.5 rounded-lg transition-colors ${
              localItem.user_relevance === true
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/10'
            }`}
          >
            <ThumbsUp size={13} />
          </button>

          {/* Thumbs down — irrelevante */}
          <button
            onClick={() => handleRelevance(false)}
            disabled={saving === 'relevance'}
            title="Irrelevante"
            className={`p-1.5 rounded-lg transition-colors ${
              localItem.user_relevance === false
                ? 'text-red-400 bg-red-400/10'
                : 'text-slate-600 hover:text-red-400 hover:bg-red-400/10'
            }`}
          >
            <ThumbsDown size={13} />
          </button>

          {/* Slack share */}
          <button
            onClick={handleShareSlack}
            disabled={localItem.slack_shared || saving === 'slack'}
            title={localItem.slack_shared ? 'Já enviado ao Slack' : 'Compartilhar no Slack'}
            className={`p-1.5 rounded-lg transition-colors ${
              localItem.slack_shared
                ? 'text-green-400 bg-green-400/10 cursor-default'
                : 'text-slate-600 hover:text-green-400 hover:bg-green-400/10'
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
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
