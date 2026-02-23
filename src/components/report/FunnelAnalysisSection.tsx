import { FunnelStep, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  funnel: { steps: FunnelStep[]; total_estimated_loss_pct: number; summary: string };
  lang: AppLanguage;
}

export default function FunnelAnalysisSection({ funnel, lang }: Props) {
  const maxDrop = Math.max(...funnel.steps.map(s => s.drop_off_pct), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">{t(lang, 'section_funnel')}</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/20 text-destructive border border-destructive/30">
          {t(lang, 'funnel_total')}: −{funnel.total_estimated_loss_pct}%
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-5">{funnel.summary}</p>

      {/* Visual funnel */}
      <div className="space-y-2 mb-5">
        {funnel.steps.map((step, i) => {
          const width = 100 - (i / funnel.steps.length) * 30; // narrowing funnel
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 text-[10px] text-muted-foreground font-mono text-right">{i + 1}</div>
              <div style={{ width: `${width}%` }} className="relative">
                <div className="h-8 bg-secondary/40 border border-border/40 rounded flex items-center px-3">
                  <span className="text-xs font-medium truncate">{step.step}</span>
                </div>
              </div>
              <div className="text-xs text-destructive font-mono font-semibold whitespace-nowrap">
                −{step.drop_off_pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-secondary/40">
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'funnel_step')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'funnel_risk')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'funnel_drop')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {funnel.steps.map((s, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-background/30' : 'bg-secondary/20'}>
                <td className="px-3 py-2 font-medium">{s.step}</td>
                <td className="px-3 py-2 text-muted-foreground">{s.risk}</td>
                <td className="px-3 py-2 text-destructive font-mono font-semibold">−{s.drop_off_pct}%</td>
                <td className="px-3 py-2 text-muted-foreground">{s.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
