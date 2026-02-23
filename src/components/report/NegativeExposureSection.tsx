import { NegativeMentionItem, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  exposure: { items: NegativeMentionItem[]; summary: string; total_critical: number };
  lang: AppLanguage;
}

function severityBadge(sev: string, lang: AppLanguage) {
  const labels: Record<string, string> = { critical: t(lang, 'sev_critical'), warning: t(lang, 'sev_warning'), low: t(lang, 'sev_low') };
  const cls = sev === 'critical' ? 'bg-destructive/20 text-destructive border-destructive/30' :
    sev === 'warning' ? 'bg-warning/20 text-warning border-warning/30' :
    'bg-success/15 text-success border-success/30';
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{labels[sev] ?? sev}</span>;
}

function actionBadge(action: string, lang: AppLanguage) {
  const labels: Record<string, string> = {
    Respond: t(lang, 'act_respond'), Monitor: t(lang, 'act_monitor'),
    Escalate: t(lang, 'act_escalate'), Ignore: t(lang, 'act_ignore'),
  };
  const cls = action === 'Escalate' ? 'text-destructive' :
    action === 'Respond' ? 'text-orange-400' :
    action === 'Monitor' ? 'text-primary' : 'text-muted-foreground';
  return <span className={`text-[10px] font-mono font-semibold ${cls}`}>{labels[action] ?? action}</span>;
}

export default function NegativeExposureSection({ exposure, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">{t(lang, 'section_negative')}</h3>
        {exposure.total_critical > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/20 text-destructive border border-destructive/30">
            {exposure.total_critical} {t(lang, 'neg_critical')}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">{exposure.summary}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-secondary/40">
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'neg_source')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'neg_type')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'neg_severity')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'neg_visibility')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'neg_action')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'neg_summary')}</th>
            </tr>
          </thead>
          <tbody>
            {exposure.items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-background/30' : 'bg-secondary/20'}>
                <td className="px-3 py-2 font-medium">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{item.source}</a>
                  ) : item.source}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{item.type}</td>
                <td className="px-3 py-2">{severityBadge(item.severity, lang)}</td>
                <td className="px-3 py-2 text-muted-foreground">{item.visibility}</td>
                <td className="px-3 py-2">{actionBadge(item.action, lang)}</td>
                <td className="px-3 py-2 text-muted-foreground leading-relaxed">{item.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
