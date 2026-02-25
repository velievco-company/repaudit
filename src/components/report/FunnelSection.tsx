import { FunnelAnalysis, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { data: FunnelAnalysis; lang: AppLanguage; }

export default function FunnelSection({ data, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_funnel')}</h3>
      <p className="text-xs text-muted-foreground mb-4">{data.summary}</p>
      <div className="space-y-2 mb-4">
        {data.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span className="font-mono w-8 text-muted-foreground">{i + 1}.</span>
            <span className="font-medium w-24">{step.step}</span>
            <span className="flex-1 text-muted-foreground">{step.risk}</span>
            <span className="font-mono text-destructive">−{step.drop_off_pct}%</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3 text-sm font-medium">
        {t(lang, 'funnel_total')}: <span className="text-destructive font-mono">{data.total_estimated_loss_pct}%</span>
      </div>
    </div>
  );
}
