import { SentimentHeatmapRow, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  heatmap: SentimentHeatmapRow[];
  lang: AppLanguage;
}

function riskBadge(risk: string) {
  const cls = risk === 'low' ? 'bg-success/15 text-success border-success/30' :
    risk === 'medium' ? 'bg-warning/15 text-warning border-warning/30' :
    'bg-destructive/15 text-destructive border-destructive/30';
  const icon = risk === 'low' ? '🟢' : risk === 'medium' ? '🟡' : '🔴';
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cls}`}>{icon}</span>;
}

export default function SentimentHeatmapSection({ heatmap, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_heatmap')}</h3>

      <div className="space-y-3">
        {heatmap.map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-32 text-xs font-medium truncate shrink-0">{row.theme}</div>
            <div className="flex-1 h-5 flex rounded overflow-hidden">
              <div
                className="bg-success/70 flex items-center justify-center transition-all"
                style={{ width: `${row.positive_pct}%` }}
                title={`${t(lang, 'heatmap_positive')}: ${row.positive_pct}%`}
              >
                {row.positive_pct >= 10 && <span className="text-[9px] text-white font-mono">{row.positive_pct}%</span>}
              </div>
              <div
                className="bg-muted flex items-center justify-center transition-all"
                style={{ width: `${row.neutral_pct}%` }}
                title={`${t(lang, 'heatmap_neutral')}: ${row.neutral_pct}%`}
              >
                {row.neutral_pct >= 10 && <span className="text-[9px] text-muted-foreground font-mono">{row.neutral_pct}%</span>}
              </div>
              <div
                className="bg-destructive/70 flex items-center justify-center transition-all"
                style={{ width: `${row.negative_pct}%` }}
                title={`${t(lang, 'heatmap_negative')}: ${row.negative_pct}%`}
              >
                {row.negative_pct >= 10 && <span className="text-[9px] text-white font-mono">{row.negative_pct}%</span>}
              </div>
            </div>
            <div className="w-6 flex justify-center">{riskBadge(row.risk)}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-success/70 inline-block" />{t(lang, 'heatmap_positive')}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-muted inline-block" />{t(lang, 'heatmap_neutral')}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-destructive/70 inline-block" />{t(lang, 'heatmap_negative')}</span>
      </div>
    </div>
  );
}
