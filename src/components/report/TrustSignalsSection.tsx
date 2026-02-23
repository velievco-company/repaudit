import { TrustSignal, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  signals: { items: TrustSignal[]; score: number; summary: string };
  lang: AppLanguage;
}

function statusLabel(status: string, lang: AppLanguage) {
  if (status === 'present') return t(lang, 'trust_present');
  if (status === 'missing') return t(lang, 'trust_missing');
  return t(lang, 'trust_partial');
}

function impactLabel(impact: string, lang: AppLanguage) {
  if (impact === 'high') return t(lang, 'trust_impact_high');
  if (impact === 'medium') return t(lang, 'trust_impact_med');
  return t(lang, 'trust_impact_low');
}

function impactCls(impact: string) {
  if (impact === 'high') return 'text-destructive';
  if (impact === 'medium') return 'text-warning';
  return 'text-muted-foreground';
}

function scoreColor(s: number) {
  if (s >= 8) return 'text-success';
  if (s >= 5) return 'text-warning';
  return 'text-destructive';
}

export default function TrustSignalsSection({ signals, lang }: Props) {
  const pct = (signals.score / 10) * 100;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">{t(lang, 'section_trust')}</h3>
        <span className={`text-xl font-bold font-mono ${scoreColor(signals.score)}`}>
          {signals.score}<span className="text-xs text-muted-foreground">/10</span>
        </span>
      </div>

      {/* Score bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full mb-4">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${signals.score >= 8 ? 'bg-success' : signals.score >= 5 ? 'bg-warning' : 'bg-destructive'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mb-4">{signals.summary}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {signals.items.map((item, i) => (
          <div key={i} className="bg-secondary/30 border border-border/50 rounded-lg p-3 flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium leading-tight">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs">{statusLabel(item.status, lang)}</span>
              <span className={`text-[10px] font-mono ${impactCls(item.impact)}`}>{impactLabel(item.impact, lang)}</span>
            </div>
            {item.note && <p className="text-[10px] text-muted-foreground mt-0.5">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
