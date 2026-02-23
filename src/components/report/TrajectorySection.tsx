import { ReputationTrajectory, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  trajectory: ReputationTrajectory;
  lang: AppLanguage;
}

export default function TrajectorySection({ trajectory, lang }: Props) {
  const data = [
    { period: t(lang, 'traj_current'), unmanaged: trajectory.current_rating, optimised: trajectory.current_rating },
    { period: t(lang, 'traj_6mo'), unmanaged: trajectory.unmanaged_6mo, optimised: trajectory.optimised_6mo },
    { period: t(lang, 'traj_12mo'), unmanaged: trajectory.unmanaged_12mo, optimised: trajectory.optimised_12mo },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_trajectory')}</h3>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 20% 14%)" />
            <XAxis dataKey="period" tick={{ fill: 'hsl(220 15% 45%)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'hsl(220 15% 45%)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(228 40% 7%)',
                border: '1px solid hsl(228 20% 14%)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(220 20% 88%)',
              }}
            />
            <Legend
              formatter={(value) => value === 'unmanaged' ? t(lang, 'traj_unmanaged') : t(lang, 'traj_optimised')}
              wrapperStyle={{ fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="unmanaged"
              stroke="#f87171"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 4, fill: '#f87171' }}
              name="unmanaged"
            />
            <Line
              type="monotone"
              dataKey="optimised"
              stroke="#4ade80"
              strokeWidth={2}
              dot={{ r: 4, fill: '#4ade80' }}
              name="optimised"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {trajectory.key_assumptions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">{t(lang, 'traj_assumptions')}</p>
          <ul className="space-y-1">
            {trajectory.key_assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-foreground/30 mt-0.5">—</span>{a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
