import { RiskIndex, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  riskIndex: RiskIndex;
  lang: AppLanguage;
}

function riskColor(level: string) {
  if (level === 'high') return 'text-destructive';
  if (level === 'moderate') return 'text-warning';
  return 'text-success';
}

function riskBg(level: string) {
  if (level === 'high') return 'bg-destructive/20 border-destructive/30';
  if (level === 'moderate') return 'bg-warning/20 border-warning/30';
  return 'bg-success/20 border-success/30';
}

export default function RiskIndexSection({ riskIndex, lang }: Props) {
  const { score, level, crisis_probability, components } = riskIndex;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
        {t(lang, 'section_risk_index')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Risk Score */}
        <div className={`border rounded-lg p-4 text-center ${riskBg(level)}`}>
          <div className={`text-3xl font-bold font-mono ${riskColor(level)}`}>{score}</div>
          <div className="text-xs text-muted-foreground mt-1">{t(lang, 'risk_score')}</div>
          <div className={`text-sm font-semibold mt-1 uppercase ${riskColor(level)}`}>
            {t(lang, `risk_level_${level}` as any)}
          </div>
        </div>

        {/* Crisis Probability */}
        <div className="border border-border/50 rounded-lg p-4 text-center bg-secondary/30">
          <div className="text-3xl font-bold font-mono text-foreground">{crisis_probability}%</div>
          <div className="text-xs text-muted-foreground mt-1">{t(lang, 'crisis_probability')}</div>
        </div>

        {/* Formula */}
        <div className="border border-border/50 rounded-lg p-4 bg-secondary/30">
          <div className="text-xs text-muted-foreground mb-2 font-mono">{t(lang, 'risk_formula')}</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(lang, 'risk_neg_sentiment')}</span>
              <span className="font-mono">{components.negative_sentiment_weight.toFixed(1)} × 0.4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(lang, 'risk_serp_neg')}</span>
              <span className="font-mono">{components.serp_negative_presence.toFixed(1)} × 0.3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(lang, 'risk_volatility')}</span>
              <span className="font-mono">{components.volatility_spike.toFixed(1)} × 0.3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Meter Bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            level === 'high' ? 'bg-destructive' : level === 'moderate' ? 'bg-warning' : 'bg-success'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
        <span>0 — {t(lang, 'risk_level_low')}</span>
        <span>{t(lang, 'risk_level_moderate')}</span>
        <span>{t(lang, 'risk_level_high')} — 100</span>
      </div>
    </div>
  );
}
