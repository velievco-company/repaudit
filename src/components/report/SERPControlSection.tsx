import { SERPControl, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  serpControl: SERPControl;
  lang: AppLanguage;
}

const TYPE_COLORS: Record<string, string> = {
  owned: '#4ade80',
  neutral: '#60a5fa',
  negative: '#f87171',
  competitor: '#fbbf24',
};

export default function SERPControlSection({ serpControl, lang }: Props) {
  const { score, owned, neutral, negative, competitor, results } = serpControl;

  const pieData = [
    { name: t(lang, 'serp_owned'), value: owned, color: TYPE_COLORS.owned },
    { name: t(lang, 'serp_neutral'), value: neutral, color: TYPE_COLORS.neutral },
    { name: t(lang, 'serp_negative'), value: negative, color: TYPE_COLORS.negative },
    { name: t(lang, 'serp_competitor'), value: competitor, color: TYPE_COLORS.competitor },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
        {t(lang, 'section_serp')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <div className="text-center mb-2">
            <span className="text-2xl font-bold font-mono text-foreground">{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(228 40% 7%)',
                    border: '1px solid hsl(228 20% 14%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(220 20% 88%)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Results */}
        <div>
          <h4 className="text-xs font-mono text-muted-foreground mb-2">{t(lang, 'serp_top10')}</h4>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="font-mono text-muted-foreground/50 w-4 flex-shrink-0">{i + 1}.</span>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: TYPE_COLORS[r.type] || '#666' }}
                />
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                  title={r.url}
                >
                  {r.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="mt-4 p-3 bg-secondary/30 border border-border/50 rounded-lg">
        <div className="text-[10px] font-mono text-muted-foreground">
          {t(lang, 'serp_formula')}: (Owned×1 + Neutral×0.5 − Negative×1) / 10 × 100 = ({owned}×1 + {neutral}×0.5 − {negative}×1) / 10 × 100 = {score}
        </div>
      </div>
    </div>
  );
}
