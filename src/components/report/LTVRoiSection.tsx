import { LTVModel, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  model: LTVModel;
  lang: AppLanguage;
}

export default function LTVRoiSection({ model, lang }: Props) {
  const metrics = [
    { label: t(lang, 'ltv_label'), value: `$${model.ltv.toLocaleString()}` },
    { label: t(lang, 'cac_label'), value: `$${model.cac.toLocaleString()}` },
    { label: t(lang, 'retention_label'), value: `${model.retention_rate}%` },
    { label: t(lang, 'churn_label'), value: `${model.churn_from_reviews_pct}%` },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_ltv')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metrics */}
        <div className="space-y-3">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center justify-between bg-secondary/30 border border-border/50 rounded-lg px-4 py-2.5">
              <span className="text-xs text-muted-foreground font-mono">{m.label}</span>
              <span className="text-sm font-bold font-mono text-foreground">{m.value}</span>
            </div>
          ))}
        </div>

        {/* Loss highlight */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 flex flex-col justify-center">
          <p className="text-xs font-mono text-destructive/70 uppercase tracking-wider mb-2">{t(lang, 'loss_label')}</p>
          <p className="text-2xl font-bold text-destructive leading-tight">
            ${model.estimated_annual_loss_min.toLocaleString()} – ${model.estimated_annual_loss_max.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{model.loss_explanation}</p>
        </div>
      </div>
    </div>
  );
}
