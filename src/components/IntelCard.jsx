import { CATEGORIES, RELEVANCE, SOURCE_TYPES } from '../lib/constants'
import { ExternalLink, Youtube, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function IntelCard({ item }) {
  const category = CATEGORIES[item.category] || {
    label: item.category,
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/30',
    dot: 'bg-slate-400',
  }
  const relevance = RELEVANCE[item.relevance]
  const isYouTube = item.source_type === 'youtube'
  const isHighRelevance = item.relevance === 'alta'

  const tags = Array.isArray(item.tags)
    ? item.tags
    : typeof item.tags === 'string'
    ? JSON.parse(item.tags || '[]')
    : []

  const keyTopics = Array.isArray(item.key_topics)
    ? item.key_topics
    : typeof item.key_topics === 'string'
    ? JSON.parse(item.key_topics || '[]')
    : []

  const publishedDate = item.published_date
    ? format(parseISO(item.published_date), "d MMM", { locale: ptBR })
    : null

  return (
    <article
      className={`bg-[#1a1d27] border rounded-xl p-4 hover:border-[#3b82f6]/40 transition-all group ${
        isHighRelevance ? 'border-red-400/30' : 'border-[#2a2d3e]'
      }`}
    >
      {/* Top row: category + relevance + source type */}
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

        <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
          {isYouTube ? (
            <>
              <Youtube size={12} className="text-red-400" />
              <span className="text-red-400/80">YouTube</span>
            </>
          ) : (
            <>
              <span>📰</span>
              <span>{item.source_name || 'Notícia'}</span>
            </>
          )}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-white font-medium text-sm sm:text-base leading-snug mb-2 group-hover:text-blue-300 transition-colors">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {item.title}
          </a>
        ) : (
          item.title
        )}
      </h3>

      {/* Summary */}
      {item.summary && (
        <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-3">{item.summary}</p>
      )}

      {/* YouTube-specific: channel + duration */}
      {isYouTube && (
        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-slate-500">
          {item.channel_name && (
            <span className="text-slate-400">📺 {item.channel_name}</span>
          )}
          {item.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {item.duration_minutes} min
            </span>
          )}
          {item.video_id && (
            <a
              href={`https://youtube.com/watch?v=${item.video_id}`}
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

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 5).map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-[#21253a] text-slate-500 px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: date + external link */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2d3e]">
        <span className="text-xs text-slate-600">
          {publishedDate || (item.collected_date ? format(parseISO(item.collected_date), "d MMM", { locale: ptBR }) : '')}
        </span>
        {item.url && !isYouTube && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors"
          >
            <ExternalLink size={12} />
            Fonte
          </a>
        )}
      </div>
    </article>
  )
}
