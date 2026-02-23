import { SourceCategory } from '@/lib/types';
import { Newspaper, MessageSquare, Smartphone, Video, Briefcase, Search } from 'lucide-react';

interface Props {
  sources: {
    media: SourceCategory;
    reviews: SourceCategory;
    social: SourceCategory;
    video: SourceCategory;
    employer: SourceCategory;
    forums: SourceCategory;
  };
}

const sourceConfig = [
  { key: 'media' as const, icon: Newspaper, label: 'СМИ и новости', emoji: '📰' },
  { key: 'reviews' as const, icon: MessageSquare, label: 'Отзывные платформы', emoji: '💬' },
  { key: 'social' as const, icon: Smartphone, label: 'Социальные сети', emoji: '📱' },
  { key: 'video' as const, icon: Video, label: 'YouTube / Видео', emoji: '🎥' },
  { key: 'employer' as const, icon: Briefcase, label: 'Работодательская репутация', emoji: '💼' },
  { key: 'forums' as const, icon: Search, label: 'Форумы и сообщества', emoji: '🔎' },
];

function sentimentColor(s: string) {
  if (s === 'positive') return 'text-success';
  if (s === 'negative') return 'text-destructive';
  if (s === 'mixed') return 'text-warning';
  return 'text-muted-foreground';
}

function sentimentLabel(s: string) {
  if (s === 'positive') return 'Позитивный';
  if (s === 'negative') return 'Негативный';
  if (s === 'mixed') return 'Смешанный';
  return 'Нейтральный';
}

function scoreColor(score: number) {
  if (score >= 8) return 'text-success';
  if (score >= 5) return 'text-warning';
  return 'text-destructive';
}

export default function SourceAnalysis({ sources }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">Анализ по источникам</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceConfig.map(({ key, label, emoji }) => {
          const src = sources[key];
          if (!src) return null;
          return (
            <div key={key} className="bg-secondary/30 border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className={`text-xl font-bold font-mono ${scoreColor(src.score)}`}>{src.score}<span className="text-xs text-muted-foreground">/10</span></span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{src.summary}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className={sentimentColor(src.sentiment)}>● {sentimentLabel(src.sentiment)}</span>
                {src.mention_count && <span className="text-muted-foreground">{src.mention_count} упоминаний</span>}
                {src.avg_rating && <span className="text-muted-foreground">★ {src.avg_rating}</span>}
              </div>
              {src.top_topics && src.top_topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {src.top_topics.map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
