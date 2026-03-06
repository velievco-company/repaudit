import { AuditResponse, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  legal: AuditResponse['legal'];
  lang: AppLanguage;
}

function riskBadge(level: string, lang: AppLanguage) {
  const cls = level === 'low' ? 'bg-success/15 text-success border-success/30' :
    level === 'medium' ? 'bg-warning/15 text-warning border-warning/30' :
    'bg-destructive/15 text-destructive border-destructive/30';
  const label = t(lang, `risk_${level}` as any);
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
        <div>
          <p className="text-xs font-mono text-muted-foreground mb-2">{t(lang, 'lawsuits')}</p>
          {legal.lawsuits.length > 0 ? legal.lawsuits.map((l, i) => (
            <p key={i} className="text-xs mb-1">— {l}</p>
          )) : <p className="text-xs text-muted-foreground/50">{t(lang, 'none_found')}</p>}
        </div>
        <div>
          <p className="text-xs font-mono text-muted-foreground mb-2">{t(lang, 'fines')}</p>
          {legal.fines.length > 0 ? legal.fines.map((f, i) => (
            <p key={i} className="text-xs mb-1">— {f}</p>
          )) : <p className="text-xs text-muted-foreground/50">{t(lang, 'none_found')}</p>}
        </div>
        <div>
          <p className="text-xs font-mono text-muted-foreground mb-2">{t(lang, 'complaints')}</p>
          {legal.complaints.length > 0 ? legal.complaints.map((c, i) => (
            <p key={i} className="text-xs mb-1">— {c}</p>
          )) : <p className="text-xs text-muted-foreground/50">{t(lang, 'none_found')}</p>}
        </div>
      </div>
    </div>
  );
}
