import { useState } from 'react';
import { AuditInput } from '@/lib/audit-engine';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface AuditFormProps {
  onSubmit: (data: AuditInput) => void;
}

const industries = ['Legal', 'Dental', 'Hotels', 'Real Estate', 'Fintech', 'Other'] as const;

export default function AuditForm({ onSubmit }: AuditFormProps) {
  const [form, setForm] = useState<AuditInput>({
    companyName: '',
    location: '',
    industry: 'Legal',
    avgRating: 4.0,
    totalReviews: 20,
    negativePercent: 10,
    googleRanking: 3,
    negativePress: false,
    glassdoor: 'none',
    monthlyTraffic: undefined,
    conversionRate: undefined,
    avgDealValue: undefined,
  });

  const update = <K extends keyof AuditInput>(key: K, value: AuditInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company Name *</Label>
          <Input id="company" value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Acme Corp" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={form.location} onChange={e => update('location', e.target.value)} placeholder="New York, NY" />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Select value={form.industry} onValueChange={v => update('industry', v as AuditInput['industry'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Reputation Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Avg Rating (0–5)</Label>
            <Input type="number" step="0.1" min="0" max="5" value={form.avgRating} onChange={e => update('avgRating', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Total Reviews</Label>
            <Input type="number" min="0" value={form.totalReviews} onChange={e => update('totalReviews', parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>% 1–2 Star Reviews</Label>
            <Input type="number" min="0" max="100" value={form.negativePercent} onChange={e => update('negativePercent', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Google Ranking (1–10)</Label>
            <Input type="number" min="1" max="10" value={form.googleRanking} onChange={e => update('googleRanking', parseInt(e.target.value) || 1)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <Switch checked={form.negativePress} onCheckedChange={v => update('negativePress', v)} />
          <Label>Negative Press?</Label>
        </div>
        <div className="space-y-2">
          <Label>Glassdoor Negativity</Label>
          <Select value={form.glassdoor} onValueChange={v => update('glassdoor', v as AuditInput['glassdoor'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="strong">Strong</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Financial Data (optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Monthly Traffic</Label>
            <Input type="number" min="0" value={form.monthlyTraffic ?? ''} onChange={e => update('monthlyTraffic', e.target.value ? parseInt(e.target.value) : undefined)} placeholder="5000" />
          </div>
          <div className="space-y-2">
            <Label>Conversion Rate %</Label>
            <Input type="number" step="0.1" min="0" max="100" value={form.conversionRate ?? ''} onChange={e => update('conversionRate', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="3.5" />
          </div>
          <div className="space-y-2">
            <Label>Avg Deal Value ($)</Label>
            <Input type="number" min="0" value={form.avgDealValue ?? ''} onChange={e => update('avgDealValue', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="2500" />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">Generate Audit</Button>
    </form>
  );
}
