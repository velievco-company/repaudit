import { SourceCategory, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  sources: {
    media: SourceCategory;
    reviews: SourceCategory;
    social: SourceCategory;
    video: SourceCategory;
    employer: SourceCategory;
    forums: SourceCategory;
  };
  lang: AppLanguage;
}

const sourceConfig = [
  { key: 'media' as const, i18nKey: 'source_media' },
  { key: 'reviews' as const, i18nKey: 'source_reviews' },
  { key: 'social' as const, i18nKey: 'source_social' },
  { key: 'video' as const, i18nKey: 'source_video' },
  { key: 'employer' as const, i18nKey: 'source_employer' },
  { key: 'forums' as const, i18nKey: 'source_forums' },
];

function sentimentColor(s: string) {
  if (s === 'positive') return 'text-success';
  if (s === 'negative') return 'text-destructive';
  if (s === 'mixed') return 'text-warning';
  return 'text-muted-foreground';
}

function scoreColor(score: number) {
  if (score >= 8) return 'text-success';
  if (score >= 5) return 'text-warning';
  return 'text-destructive';
}

export default function SourceAnalysis({ sources, lang }: Props) {
  const sentimentLabel = (s: string) => t(lang, `sentiment_${s}` as any);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_sources')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceConfig.map(({ key, i18nKey }) => {
          const src = sources[key];
          if (!src) return null;
          return (
            <div key={key} className="bg-secondary/30 border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{t(lang, i18nKey as any)}</span>
                <span className={`text-xl font-bold font-mono ${scoreColor(src.score)}`}>{src.score}<span className="text-xs text-muted-foreground">/10</span></span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{src.summary}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className={sentimentColor(src.sentiment)}>● {sentimentLabel(src.sentiment)}</span>
                {src.mention_count && <span className="text-muted-foreground">{src.mention_count} {t(lang, 'mentions')}</span>}
                {src.avg_rating && <span className="text-muted-foreground">★ {src.avg_rating}</span>}
              </div>
              {src.top_topics && src.top_topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {src.top_topics.map((topic, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{topic}</span>
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
