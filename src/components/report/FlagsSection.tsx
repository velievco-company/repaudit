import { FlagItem, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { redFlags: FlagItem[]; greenFlags: FlagItem[]; lang: AppLanguage; }

export default function FlagsSection({ redFlags, greenFlags, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_flags')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-destructive mb-3">{t(lang, 'red_flags')}</h4>
          <div className="space-y-2">
            {redFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.severity === 'critical' ? 'bg-destructive' : f.severity === 'warning' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                <span className="text-muted-foreground">{f.text}</span>
              </div>
            ))}
            {redFlags.length === 0 && <p className="text-xs text-muted-foreground/50">{t(lang, 'not_found')}</p>}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-success mb-3">{t(lang, 'green_flags')}</h4>
          <div className="space-y-2">
            {greenFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                <span className="text-muted-foreground">{f.text}</span>
              </div>
            ))}
            {greenFlags.length === 0 && <p className="text-xs text-muted-foreground/50">{t(lang, 'not_found')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
