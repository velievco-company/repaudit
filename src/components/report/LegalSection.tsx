import { AuditResponse } from '@/lib/types';

interface Props {
  legal: AuditResponse['legal'];
}

function riskBadge(level: string) {
  const cls = level === 'low' ? 'bg-success/15 text-success border-success/30' :
    level === 'medium' ? 'bg-warning/15 text-warning border-warning/30' :
    'bg-destructive/15 text-destructive border-destructive/30';
  const label = level === 'low' ? 'Низкий' : level === 'medium' ? 'Средний' : 'Высокий';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

export default function LegalSection({ legal }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">⚖️ Юридический и регуляторный след</h3>
        {riskBadge(legal.risk_level)}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{legal.summary}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground mb-2">Судебные иски</p>
          {legal.lawsuits.length > 0 ? legal.lawsuits.map((l, i) => (
            <p key={i} className="text-xs mb-1">— {l}</p>
          )) : <p className="text-xs text-muted-foreground/50">Не обнаружено</p>}
        </div>
        <div>
          <p className="text-xs font-mono text-muted-foreground mb-2">Штрафы и предписания</p>
          {legal.fines.length > 0 ? legal.fines.map((f, i) => (
            <p key={i} className="text-xs mb-1">— {f}</p>
          )) : <p className="text-xs text-muted-foreground/50">Не обнаружено</p>}
        </div>
        <div>
          <p className="text-xs font-mono text-muted-foreground mb-2">Жалобы</p>
          {legal.complaints.length > 0 ? legal.complaints.map((c, i) => (
            <p key={i} className="text-xs mb-1">— {c}</p>
          )) : <p className="text-xs text-muted-foreground/50">Не обнаружено</p>}
        </div>
      </div>
    </div>
  );
}
