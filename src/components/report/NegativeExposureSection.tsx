import { NegativeExposure, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { data: NegativeExposure; lang: AppLanguage; }

export default function NegativeExposureSection({ data, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_negative')}</h3>
      <p className="text-xs text-muted-foreground mb-2">{data.total_critical} {t(lang, 'neg_critical')}</p>
      <p className="text-xs text-muted-foreground mb-4">{data.summary}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2">{t(lang, 'neg_source')}</th>
            <th className="text-left py-2">{t(lang, 'neg_type')}</th>
            <th className="text-left py-2">{t(lang, 'neg_severity')}</th>
            <th className="text-left py-2">{t(lang, 'neg_visibility')}</th>
            <th className="text-left py-2">{t(lang, 'neg_action')}</th>
            <th className="text-left py-2">{t(lang, 'neg_summary')}</th>
          </tr></thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-2">{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{item.source}</a> : item.source}</td>
                <td className="py-2">{item.type}</td>
                <td className="py-2"><span className={item.severity === 'critical' ? 'text-destructive' : item.severity === 'warning' ? 'text-warning' : 'text-muted-foreground'}>{item.severity}</span></td>
                <td className="py-2">{item.visibility}</td>
                <td className="py-2">{item.action}</td>
                <td className="py-2 text-muted-foreground">{item.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
