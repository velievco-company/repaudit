import { TrustSignals, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { data: TrustSignals; lang: AppLanguage; }

export default function TrustSignalSection({ data, lang }: Props) {
  if (!data) return null;
  const items = Array.isArray(data.items) ? data.items : [];
  const statusLabel = (s: string) => s === 'present' ? t(lang, 'trust_present') : s === 'missing' ? t(lang, 'trust_missing') : t(lang, 'trust_partial');

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">{t(lang, 'section_trust')}</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg font-bold font-mono">{data.score ?? 0}</span><span className="text-xs text-muted-foreground">/10</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{data.summary ?? ''}</p>
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs border-b border-border/30 py-2">
              <span>{item?.name ?? ''}</span>
              <span>{statusLabel(item?.status ?? 'unknown')}</span>
              <span className="text-muted-foreground">{item?.impact ?? ''}</span>
              {item?.note && <span className="text-muted-foreground/60 truncate max-w-[200px]">{item.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
