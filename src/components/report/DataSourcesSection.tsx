import { AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';
import { ExternalLink } from 'lucide-react';

interface Props {
  sources: string[];
  lang: AppLanguage;
}

export default function DataSourcesSection({ sources, lang }: Props) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
        {t(lang, 'section_data_sources')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {sources.map((url, i) => {
          let domain = '';
          try { domain = new URL(url).hostname.replace('www.', ''); } catch { domain = url; }
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:underline truncate py-1"
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{domain}</span>
            </a>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground/50 mt-3 font-mono">
        {sources.length} {t(lang, 'sources_analyzed')}
      </p>
    </div>
  );
}
