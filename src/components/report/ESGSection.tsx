import { AuditResponse, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  esg: AuditResponse['esg'];
  lang: AppLanguage;
}

function overallBadge(level: string, lang: AppLanguage) {
  const cls = level === 'clean' ? 'bg-success/15 text-success border-success/30' :
    level === 'concerns' ? 'bg-warning/15 text-warning border-warning/30' :
    'bg-destructive/15 text-destructive border-destructive/30';
  const label = t(lang, level === 'clean' ? 'esg_clean' : level === 'concerns' ? 'esg_concerns' : 'esg_serious');
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

export default function ESGSection({ esg, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">{t(lang, 'section_esg')}</h3>
        {overallBadge(esg.overall, lang)}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{esg.summary}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
          <p className="text-xs font-mono text-muted-foreground mb-1">{t(lang, 'esg_ecology')}</p>
          <p className="text-xs">{esg.ecology}</p>
        </div>
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
          <p className="text-xs font-mono text-muted-foreground mb-1">{t(lang, 'esg_labor')}</p>
          <p className="text-xs">{esg.labor}</p>
        </div>
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
          <p className="text-xs font-mono text-muted-foreground mb-1">{t(lang, 'esg_privacy')}</p>
          <p className="text-xs">{esg.data_privacy}</p>
        </div>
      </div>
    </div>
  );
}
