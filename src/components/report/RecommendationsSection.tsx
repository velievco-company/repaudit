import { AuditResponse, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  recommendations: AuditResponse['recommendations'];
  lang: AppLanguage;
}

export default function RecommendationsSection({ recommendations, lang }: Props) {
  if (!recommendations) return null;
  const levels = [
    { key: 'urgent' as const, labelKey: 'rec_urgent', subKey: 'rec_urgent_sub', border: 'border-destructive/30' },
    { key: 'mid_term' as const, labelKey: 'rec_mid', subKey: 'rec_mid_sub', border: 'border-warning/30' },
    { key: 'long_term' as const, labelKey: 'rec_long', subKey: 'rec_long_sub', border: 'border-success/30' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_recommendations')}</h3>
      <div className="space-y-4">
        {levels.map(({ key, labelKey, subKey, border }) => {
          const items = Array.isArray((recommendations as any)?.[key]) ? (recommendations as any)[key] : [];
          return (
            <div key={key} className={`border ${border} rounded-lg p-4`}>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                {t(lang, labelKey as any)}
                <span className="text-xs text-muted-foreground font-normal">— {t(lang, subKey as any)}</span>
              </h4>
              <ul className="space-y-1.5">
                {items.map((r: any, i: number) => {
                  const text = typeof r === 'string' ? r : r?.text ?? r?.action ?? JSON.stringify(r);
                  return (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-foreground/30 mt-0.5">—</span>{text}
                    </li>
                  );
                })}
                {items.length === 0 && <li className="text-xs text-muted-foreground/50">{t(lang, 'no_recs')}</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
