import { ConfidenceLevel, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  score: number;
  verdict: string;
  dataDate: string;
  confidence: ConfidenceLevel;
  lang: AppLanguage;
}

function getScoreColor(score: number) {
  if (score >= 86) return 'text-emerald-400';
  if (score >= 66) return 'text-green-400';
  if (score >= 41) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreStroke(score: number) {
  if (score >= 86) return '#34d399';
  if (score >= 66) return '#4ade80';
  if (score >= 41) return '#fbbf24';
  return '#f87171';
}

export default function ScoreHero({ score, verdict, dataDate, confidence, lang }: Props) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const confLabel = confidence === 'high' ? t(lang, 'confidence_high') :
    confidence === 'medium' ? t(lang, 'confidence_medium') : t(lang, 'confidence_low');
  const confColor = confidence === 'high' ? 'text-success' :
    confidence === 'medium' ? 'text-warning' : 'text-destructive';

  return (
    <div className="bg-card border border-border rounded-xl p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(228 20% 14%)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={getScoreStroke(score)}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
            <span className="text-xs text-muted-foreground font-mono">/ 100</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{verdict}</h2>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground font-mono">
            <span>{t(lang, 'data_as_of')} {dataDate}</span>
            <span>·</span>
            <span className={confColor}>{t(lang, 'confidence_label')}: {confLabel}</span>
          </div>
        </div>import { ConfidenceLevel, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  score: number;
  verdict: string;
  dataDate: string;
  confidence: ConfidenceLevel;
  lang: AppLanguage;
}

function getScoreColor(score: number) {
  if (score >= 86) return 'text-emerald-400';
  if (score >= 66) return 'text-green-400';
  if (score >= 41) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreStroke(score: number) {
  if (score >= 86) return '#34d399';
  if (score >= 66) return '#4ade80';
  if (score >= 41) return '#fbbf24';
  return '#f87171';
}

export default function ScoreHero({ score, verdict, dataDate, confidence, lang }: Props) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const confLabel = confidence === 'high' ? t(lang, 'confidence_high') :
    confidence === 'medium' ? t(lang, 'confidence_medium') : t(lang, 'confidence_low');
  const confColor = confidence === 'high' ? 'text-success' :
    confidence === 'medium' ? 'text-warning' : 'text-destructive';

  return (
    <div className="bg-card border border-border rounded-xl p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(228 20% 14%)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={getScoreStroke(score)}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
            <span className="text-xs text-muted-foreground font-mono">/ 100</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{verdict}</h2>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground font-mono">
            <span>{t(lang, 'data_as_of')} {dataDate}</span>
            <span>·</span>
            <span className={confColor}>{t(lang, 'confidence_label')}: {confLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

      </div>
    </div>
  );
}
