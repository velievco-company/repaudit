import { TrajectoryForecast, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { data: TrajectoryForecast; lang: AppLanguage; }

export default function TrajectorySection({ data, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_trajectory')}</h3>
      
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2"></th>
            <th className="text-center py-2">{t(lang, 'traj_current')}</th>
            <th className="text-center py-2">{t(lang, 'traj_6mo')}</th>
            <th className="text-center py-2">{t(lang, 'traj_12mo')}</th>
          </tr></thead>
          <tbody>
            <tr className="border-b border-border/30">
              <td className="py-2 text-muted-foreground">{t(lang, 'traj_unmanaged')}</td>
              <td className="py-2 text-center font-mono">{data.current_rating}</td>
              <td className="py-2 text-center font-mono text-destructive">{data.unmanaged_6mo}</td>
              <td className="py-2 text-center font-mono text-destructive">{data.unmanaged_12mo}</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 text-muted-foreground">{t(lang, 'traj_optimised')}</td>
              <td className="py-2 text-center font-mono">{data.current_rating}</td>
              <td className="py-2 text-center font-mono text-success">{data.optimised_6mo}</td>
              <td className="py-2 text-center font-mono text-success">{data.optimised_12mo}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {data.key_assumptions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-2">{t(lang, 'traj_assumptions')}</h4>
          <ul className="space-y-1">
            {data.key_assumptions.map((a, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-foreground/30 mt-0.5">—</span>{a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
