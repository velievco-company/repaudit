import { AuditResponse } from '@/lib/types';

interface Props {
  management: AuditResponse['management'];
}

function sentimentDot(s: string) {
  if (s === 'positive') return 'bg-success';
  if (s === 'negative') return 'bg-destructive';
  return 'bg-muted-foreground';
}

export default function ManagementSection({ management }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">👤 Репутация топ-менеджмента</h3>
      <p className="text-sm text-muted-foreground mb-4">{management.summary}</p>
      {management.persons.length > 0 && (
        <div className="space-y-3">
          {management.persons.map((p, i) => (
            <div key={i} className="bg-secondary/30 border border-border/50 rounded-lg p-3 flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${sentimentDot(p.sentiment)}`} />
              <div>
                <p className="text-sm font-medium">{p.name} <span className="text-xs text-muted-foreground">— {p.role}</span></p>
                <p className="text-xs text-muted-foreground mt-1">{p.summary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
