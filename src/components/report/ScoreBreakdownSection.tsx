import { ScoreBreakdown, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface Props {
  breakdown: ScoreBreakdown;
  overallScore: number;
  lang: AppLanguage;
}

const WEIGHTS = {
  review_sentiment: 0.35,
  review_volume: 0.15,
  serp_control: 0.15,
  media_sentiment: 0.15,
  share_of_voice: 0.10,
  low_volatility: 0.10,
};

export default function ScoreBreakdownSection({ breakdown, overallScore, lang }: Props) {
  const items = [
    { key: 'review_sentiment', label: t(lang, 'score_review_sentiment'), value: breakdown.review_sentiment, weight: WEIGHTS.review_sentiment },
    { key: 'review_volume', label: t(lang, 'score_review_volume'), value: breakdown.review_volume, weight: WEIGHTS.review_volume },
    { key: 'serp_control', label: t(lang, 'score_serp_control'), value: breakdown.serp_control, weight: WEIGHTS.serp_control },
    { key: 'media_sentiment', label: t(lang, 'score_media_sentiment'), value: breakdown.media_sentiment, weight: WEIGHTS.media_sentiment },
    { key: 'share_of_voice', label: t(lang, 'score_share_voice'), value: breakdown.share_of_voice, weight: WEIGHTS.share_of_voice },
    { key: 'low_volatility', label: t(lang, 'score_low_volatility'), value: breakdown.low_volatility, weight: WEIGHTS.low_volatility },
  ];

  const chartData = items.map(i => ({
    name: i.label,
    raw: i.value,
    weighted: Math.round(i.value * i.weight),
    weight: `${(i.weight * 100).toFixed(0)}%`,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
        {t(lang, 'section_score_breakdown')}
      </h3>

      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(220 15% 45%)', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'hsl(220 15% 45%)', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(228 40% 7%)', border: '1px solid hsl(228 20% 14%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(220 20% 88%)' }}
              formatter={(val: number, name: string) => [val, name === 'raw' ? 'Score' : 'Weighted']}
            />
            <Bar dataKey="raw" radius={[0, 4, 4, 0]} barSize={14}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={`hsl(${215 + i * 20}, 70%, 55%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Formula */}
      <div className="p-3 bg-secondary/30 border border-border/50 rounded-lg">
        <div className="text-[10px] font-mono text-muted-foreground">
          {t(lang, 'score_formula')}: {items.map(i => `(${i.value}×${i.weight})`).join(' + ')} = <span className="text-foreground font-semibold">{overallScore}</span>
        </div>
      </div>
    </div>
  );
}
