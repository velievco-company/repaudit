import { AuditResponse } from '@/lib/types';

interface Props {
  esg: AuditResponse['esg'];
}

function overallBadge(level: string) {
  const cls = level === 'clean' ? 'bg-success/15 text-success border-success/30' :
    level === 'concerns' ? 'bg-warning/15 text-warning border-warning/30' :
    'bg-destructive/15 text-destructive border-destructive/30';
  const label = level === 'clean' ? 'Чисто' : level === 'concerns' ? 'Есть вопросы' : 'Серьёзные риски';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

export default function ESGSection({ esg }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">🌍 ESG и этические риски</h3>
        {overallBadge(esg.overall)}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{esg.summary}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
          <p className="text-xs font-mono text-muted-foreground mb-1">Экология</p>
          <p className="text-xs">{esg.ecology}</p>
        </div>
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
          <p className="text-xs font-mono text-muted-foreground mb-1">Трудовые условия</p>
          <p className="text-xs">{esg.labor}</p>
        </div>
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
          <p className="text-xs font-mono text-muted-foreground mb-1">Защита данных</p>
          <p className="text-xs">{esg.data_privacy}</p>
        </div>
      </div>
    </div>
  );
}
