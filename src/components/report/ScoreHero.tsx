import { ConfidenceLevel } from '@/lib/types';

interface Props {
  score: number;
  verdict: string;
  dataDate: string;
  confidence: ConfidenceLevel;
}

function getScoreColor(score: number) {
  if (score >= 86) return 'text-emerald-400';
  if (score >= 66) return 'text-green-400';
  if (score >= 41) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBg(score: number) {
  if (score >= 86) return 'from-emerald-500/20 to-emerald-500/5';
  if (score >= 66) return 'from-green-500/20 to-green-500/5';
  if (score >= 41) return 'from-amber-500/20 to-amber-500/5';
  return 'from-red-500/20 to-red-500/5';
}

function getScoreRing(score: number) {
  if (score >= 86) return 'border-emerald-400';
  if (score >= 66) return 'border-green-400';
  if (score >= 41) return 'border-amber-400';
  return 'border-red-400';
}

export default function ScoreHero({ score, verdict, dataDate, confidence }: Props) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-xl p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(228 20% 14%)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={score >= 86 ? '#34d399' : score >= 66 ? '#4ade80' : score >= 41 ? '#fbbf24' : '#f87171'}
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
            <span>Данные на {dataDate}</span>
            <span>·</span>
            <span className={confidence === 'high' ? 'text-success' : confidence === 'medium' ? 'text-warning' : 'text-destructive'}>
              Достоверность: {confidence === 'high' ? 'Высокая' : confidence === 'medium' ? 'Средняя' : 'Низкая'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
