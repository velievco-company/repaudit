import { AuditResponse, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { legal: AuditResponse['legal']; lang: AppLanguage; }

function riskBadge(level: string, lang: AppLanguage) {
  const cls = level === 'low' ? 'bg-success/15 text-success border-success/30' :
    level === 'medium' ? 'bg-warning/15 text-warning border-warning/30' :
    'bg-destructive/15 text-destructive border-destructive/30';
  const label = level === 'low' ? t(lang, 'risk_low') : level === 'medium' ? t(lang, 'risk_medium') : t(lang, 'risk_high');
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

export default function LegalSection({ legal, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">{t(lang, 'section_legal')}</h3>
        {riskBadge(legal.risk_level, lang)}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{legal.summary}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t(lang, 'lawsuits'), items: legal.lawsuits },
          { label: t(lang, 'fines'), items: legal.fines },
          { label: t(lang, 'complaints'), items: legal.complaints },
        ].map(({ label, items }) => (
          <div key={label}>
            <p className="text-xs font-mono text-muted-foreground mb-2">{label}</p>
            {items.length > 0
              ? items.map((item, i) => <p key={i} className="text-xs mb-1">— {item}</p>)
              : <p className="text-xs text-muted-foreground/50">{t(lang, 'none_found')}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
