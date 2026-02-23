import { PriorityMatrixItem, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  matrix: PriorityMatrixItem[];
  lang: AppLanguage;
}

type Impact = 'High' | 'Medium' | 'Low';
type Effort = 'High' | 'Medium' | 'Low';

const priorityBorder: Record<string, string> = {
  Critical: 'border-destructive/50 bg-destructive/5',
  High: 'border-warning/50 bg-warning/5',
  Medium: 'border-primary/30 bg-primary/5',
  Low: 'border-border bg-secondary/20',
};

const priorityDot: Record<string, string> = {
  Critical: 'bg-destructive',
  High: 'bg-warning',
  Medium: 'bg-primary',
  Low: 'bg-muted-foreground',
};

interface Quadrant {
  impact: Impact;
  effort: Effort;
  titleKey: 'quadrant_quickwin' | 'quadrant_major' | 'quadrant_fillin' | 'quadrant_avoid';
  color: string;
}

const quadrants: Quadrant[] = [
  { impact: 'High', effort: 'Low', titleKey: 'quadrant_quickwin', color: 'border-success/40 bg-success/5' },
  { impact: 'High', effort: 'High', titleKey: 'quadrant_major', color: 'border-warning/40 bg-warning/5' },
  { impact: 'Low', effort: 'Low', titleKey: 'quadrant_fillin', color: 'border-primary/30 bg-primary/5' },
  { impact: 'Low', effort: 'High', titleKey: 'quadrant_avoid', color: 'border-border bg-secondary/20' },
];

export default function PriorityMatrixSection({ matrix, lang }: Props) {
  const getItems = (impact: Impact, effort: Effort) =>
    matrix.filter(item => item.impact === impact && item.effort === effort);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">{t(lang, 'section_priority')}</h3>

      {/* Axis labels */}
      <div className="relative mb-1">
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-1">
          <span>← {t(lang, 'prio_effort')}: Low</span>
          <span>High →</span>
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quadrants.map(({ impact, effort, titleKey, color }) => {
          const items = getItems(impact, effort);
          return (
            <div key={`${impact}-${effort}`} className={`border rounded-lg p-3 min-h-28 ${color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold text-foreground uppercase tracking-wider">
                  {t(lang, titleKey)}
                </span>
                <span className="text-[9px] text-muted-foreground">{impact} Impact</span>
              </div>
              <div className="space-y-1.5">
                {items.length === 0 && <p className="text-[10px] text-muted-foreground/40">—</p>}
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${priorityDot[item.priority]}`} />
                    <span className="text-[10px] leading-tight">{item.action}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-secondary/40">
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'prio_action')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'prio_impact')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'prio_effort')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'prio_priority')}</th>
            </tr>
          </thead>
          <tbody>
            {[...matrix].sort((a, b) => {
              const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
              return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
            }).map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-background/30' : 'bg-secondary/20'}>
                <td className="px-3 py-2">{item.action}</td>
                <td className="px-3 py-2 text-muted-foreground">{item.impact}</td>
                <td className="px-3 py-2 text-muted-foreground">{item.effort}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[item.priority]}`} />
                    {item.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
