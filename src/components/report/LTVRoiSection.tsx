import { LTVRoiModel, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { data: LTVRoiModel; lang: AppLanguage; }

export default function LTVRoiSection({ data, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_ltv')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono">${data.ltv.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">{t(lang, 'ltv_label')}</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono">${data.cac.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">{t(lang, 'cac_label')}</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono">{data.retention_rate}%</div>
          <div className="text-[10px] text-muted-foreground">{t(lang, 'retention_label')}</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono text-destructive">{data.churn_from_reviews_pct}%</div>
          <div className="text-[10px] text-muted-foreground">{t(lang, 'churn_label')}</div>
        </div>
      </div>
      <div className="border border-destructive/30 bg-destructive/10 rounded-lg p-4 text-center mb-4">
        <div className="text-xs text-muted-foreground mb-1">{t(lang, 'loss_label')}</div>
        <div className="text-2xl font-bold font-mono text-destructive">
          ${data.estimated_annual_loss_min.toLocaleString()} – ${data.estimated_annual_loss_max.toLocaleString()}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{data.loss_explanation}</p>
    </div>
  );
}
