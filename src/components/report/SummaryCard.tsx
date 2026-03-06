import { AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  summary: { main_activity: string; key_narratives: string[]; key_event: string };
  company: string;
  lang: AppLanguage;
}

export default function SummaryCard({ summary, company, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_summary')}</h3>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-mono">{t(lang, 'main_activity')}</p>
          <p className="text-sm leading-relaxed">{summary.main_activity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-mono">{t(lang, 'key_narratives')}</p>
          <div className="flex flex-wrap gap-2">
            {summary.key_narratives.map((n, i) => (
              <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">{n}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-mono">{t(lang, 'key_event')}</p>
          <p className="text-sm leading-relaxed text-warning">{summary.key_event}</p>
        </div>
      </div>
    </div>
  );
}
