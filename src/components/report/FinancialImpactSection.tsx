import { FinancialImpact, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  financialImpact: FinancialImpact;
  lang: AppLanguage;
}

export default function FinancialImpactSection({ financialImpact, lang }: Props) {
  const { lost_revenue_estimate, sentiment_gap_pct, explanation, formula_inputs } = financialImpact;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
        {t(lang, 'section_financial')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main metric */}
        <div className="border border-destructive/30 bg-destructive/10 rounded-lg p-6 text-center">
          <div className="text-xs text-muted-foreground mb-2">{t(lang, 'financial_lost_revenue')}</div>
          <div className="text-3xl font-bold font-mono text-destructive">
            ${lost_revenue_estimate.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {t(lang, 'financial_sentiment_gap')}: {sentiment_gap_pct}%
          </div>
        </div>

        {/* Formula inputs */}
        <div className="border border-border/50 bg-secondary/30 rounded-lg p-4">
          <div className="text-xs font-mono text-muted-foreground mb-3">{t(lang, 'financial_formula')}</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(lang, 'financial_traffic')}</span>
              <span className="font-mono">{formula_inputs.estimated_traffic.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(lang, 'financial_conversion')}</span>
              <span className="font-mono">{formula_inputs.conversion_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(lang, 'financial_deal_size')}</span>
              <span className="font-mono">${formula_inputs.avg_deal_size.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(lang, 'financial_impact_pct')}</span>
              <span className="font-mono text-destructive">{formula_inputs.sentiment_impact_pct}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground">
            Lost = Traffic × Conv% × DealSize × Impact%
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">{explanation}</p>
    </div>
  );
}
