import { PriorityMatrixItem, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { data: PriorityMatrixItem[]; lang: AppLanguage; }

function priorityColor(p: string) {
  const lower = p.toLowerCase();
  if (lower === 'critical') return 'text-destructive';
  if (lower === 'high') return 'text-warning';
  if (lower === 'medium') return 'text-primary';
  return 'text-muted-foreground';
}

export default function PriorityMatrixSection({ data, lang }: Props) {
  const quickWins = data.filter(d => d.impact.toLowerCase() === 'high' && d.effort.toLowerCase() === 'low');
  const majorProjects = data.filter(d => d.impact.toLowerCase() === 'high' && d.effort.toLowerCase() === 'high');
  const fillIn = data.filter(d => d.impact.toLowerCase() === 'low' && d.effort.toLowerCase() === 'low');
  const reconsider = data.filter(d => d.impact.toLowerCase() === 'low' && d.effort.toLowerCase() === 'high');

  const quadrants = [
    { label: t(lang, 'quadrant_quickwin'), items: quickWins, border: 'border-success/30' },
    { label: t(lang, 'quadrant_major'), items: majorProjects, border: 'border-warning/30' },
    { label: t(lang, 'quadrant_fillin'), items: fillIn, border: 'border-muted/30' },
    { label: t(lang, 'quadrant_avoid'), items: reconsider, border: 'border-destructive/30' },
  ].filter(q => q.items.length > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_priority')}</h3>
      
      {quadrants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {quadrants.map((q, i) => (
            <div key={i} className={`border ${q.border} rounded-lg p-3`}>
              <h4 className="text-xs font-medium mb-2">{q.label}</h4>
              <ul className="space-y-1">
                {q.items.map((item, j) => (
                  <li key={j} className="text-xs text-muted-foreground">— {item.action}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2">{t(lang, 'prio_action')}</th>
            <th className="text-center py-2">{t(lang, 'prio_impact')}</th>
            <th className="text-center py-2">{t(lang, 'prio_effort')}</th>
            <th className="text-center py-2">{t(lang, 'prio_priority')}</th>
          </tr></thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-2">{item.action}</td>
                <td className="py-2 text-center">{item.impact}</td>
                <td className="py-2 text-center">{item.effort}</td>
                <td className={`py-2 text-center font-medium ${priorityColor(item.priority)}`}>{item.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
