import { AnomalyAlert, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';
import { AlertTriangle } from 'lucide-react';

interface Props {
  alerts: AnomalyAlert[];
  lang: AppLanguage;
}

function severityIcon(severity: string) {
  if (severity === 'critical') return 'bg-destructive text-destructive-foreground';
  if (severity === 'warning') return 'bg-warning text-warning-foreground';
  return 'bg-muted text-muted-foreground';
}

function severityBorder(severity: string) {
  if (severity === 'critical') return 'border-destructive/40';
  if (severity === 'warning') return 'border-warning/40';
  return 'border-border';
}

export default function AnomalyAlertSection({ alerts, lang }: Props) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        {t(lang, 'section_anomaly')}
      </h3>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className={`border ${severityBorder(alert.severity)} rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${severityIcon(alert.severity)}`}>
                {alert.severity}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">{alert.type}</div>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                {alert.detected_at && (
                  <span className="text-[10px] text-muted-foreground/60 font-mono mt-1 block">{alert.detected_at}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
