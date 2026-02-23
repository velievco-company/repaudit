import { AuditResponse } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  competitors: AuditResponse['competitors'];
  company: string;
}

export default function CompetitorSection({ competitors, company }: Props) {
  const chartData = [
    { name: company, mentions: competitors.data.reduce((a, b) => a + b.mentions, 0) / Math.max(competitors.data.length, 1), sentiment_score: 0, isCompany: true },
    ...competitors.data.map(c => ({ ...c, isCompany: false })),
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">📊 Конкурентный контекст (Share of Voice)</h3>
      <p className="text-sm text-muted-foreground mb-4">{competitors.summary}</p>
      {competitors.data.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 20% 14%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(220 15% 45%)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'hsl(220 15% 45%)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(228 40% 7%)', border: '1px solid hsl(228 20% 14%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(220 20% 88%)' }} />
              <Bar dataKey="mentions" radius={[4, 4, 0, 0]} name="Упоминания">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.isCompany ? '#2D7EFF' : 'hsl(228 20% 25%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
