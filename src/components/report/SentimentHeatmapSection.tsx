import { SentimentHeatmapRow, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { data: SentimentHeatmapRow[]; lang: AppLanguage; }

function riskColor(risk: string) {
  if (risk === 'high') return 'text-destructive';
  if (risk === 'medium') return 'text-warning';
  return 'text-success';
}

export default function SentimentHeatmapSection({ data, lang }: Props) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_heatmap')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2">{t(lang, 'heatmap_theme')}</th>
            <th className="text-center py-2">{t(lang, 'heatmap_positive')}</th>
            <th className="text-center py-2">{t(lang, 'heatmap_neutral')}</th>
            <th className="text-center py-2">{t(lang, 'heatmap_negative')}</th>
            <th className="text-center py-2">{t(lang, 'heatmap_risk')}</th>
          </tr></thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-2 font-medium">{row?.theme ?? ''}</td>
                <td className="py-2 text-center font-mono text-success">{row?.positive_pct ?? 0}%</td>
                <td className="py-2 text-center font-mono text-muted-foreground">{row?.neutral_pct ?? 0}%</td>
                <td className="py-2 text-center font-mono text-destructive">{row?.negative_pct ?? 0}%</td>
                <td className={`py-2 text-center font-mono ${riskColor(row?.risk ?? 'low')}`}>{row?.risk ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
