import { AuditResponse } from '@/lib/types';

interface Props {
  recommendations: AuditResponse['recommendations'];
}

const levels = [
  { key: 'urgent' as const, label: 'Срочно', icon: '🔴', sublabel: 'Исправить немедленно', border: 'border-destructive/30' },
  { key: 'mid_term' as const, label: 'Среднесрочно', icon: '🟡', sublabel: '3–6 месяцев', border: 'border-warning/30' },
  { key: 'long_term' as const, label: 'Долгосрочно', icon: '🟢', sublabel: 'Стратегические направления', border: 'border-success/30' },
];

export default function RecommendationsSection({ recommendations }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">📋 Рекомендации по управлению репутацией</h3>
      <div className="space-y-4">
        {levels.map(({ key, label, icon, sublabel, border }) => (
          <div key={key} className={`border ${border} rounded-lg p-4`}>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              {icon} {label}
              <span className="text-xs text-muted-foreground font-normal">— {sublabel}</span>
            </h4>
            <ul className="space-y-1.5">
              {recommendations[key].map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-foreground/30 mt-0.5">—</span>{r}
                </li>
              ))}
              {recommendations[key].length === 0 && <li className="text-xs text-muted-foreground/50">Нет рекомендаций</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
