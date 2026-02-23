import { SentimentPoint, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface Props { data: SentimentPoint[]; lang: AppLanguage; }

export default function SentimentTimeline({ data, lang }: Props) {
  if (!data || data.length === 0) return null;
  const eventsData = data.filter(d => d.event);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">{t(lang, 'section_timeline')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 20% 14%)" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(220 15% 45%)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'hsl(220 15% 45%)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(228 40% 7%)', border: '1px solid hsl(228 20% 14%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(220 20% 88%)' }} />
            <Line type="monotone" dataKey="positive" stroke="#4ade80" strokeWidth={2} dot={false} name={t(lang, 'sentiment_positive')} />
            <Line type="monotone" dataKey="neutral" stroke="#60a5fa" strokeWidth={2} dot={false} name={t(lang, 'sentiment_neutral')} />
            <Line type="monotone" dataKey="negative" stroke="#f87171" strokeWidth={2} dot={false} name={t(lang, 'sentiment_negative')} />
            {eventsData.map((evt, i) => (
              <ReferenceDot key={i} x={evt.month} y={Math.max(evt.positive, evt.neutral, evt.negative)} r={4} fill="#fbbf24" stroke="#fbbf24" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {eventsData.length > 0 && (
        <div className="mt-3 space-y-1">
          {eventsData.map((evt, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
              <span className="text-muted-foreground font-mono">{evt.month}:</span>
              <span>{evt.event}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { SentimentPoint } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface Props {
  data: SentimentPoint[];
}

export default function SentimentTimeline({ data }: Props) {
  if (!data || data.length === 0) return null;

  const eventsData = data.filter(d => d.event);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">Динамика тональности</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 20% 14%)" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(220 15% 45%)', fontSize: 11 }} tickLine={false} axisLine={false} />
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
            <Line type="monotone" dataKey="positive" stroke="#4ade80" strokeWidth={2} dot={false} name="Позитивные" />
            <Line type="monotone" dataKey="neutral" stroke="#60a5fa" strokeWidth={2} dot={false} name="Нейтральные" />
            <Line type="monotone" dataKey="negative" stroke="#f87171" strokeWidth={2} dot={false} name="Негативные" />
            {eventsData.map((evt, i) => (
              <ReferenceDot key={i} x={evt.month} y={Math.max(evt.positive, evt.neutral, evt.negative)} r={4} fill="#fbbf24" stroke="#fbbf24" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {eventsData.length > 0 && (
        <div className="mt-3 space-y-1">
          {eventsData.map((evt, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
              <span className="text-muted-foreground font-mono">{evt.month}:</span>
              <span>{evt.event}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
