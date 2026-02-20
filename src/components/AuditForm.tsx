import { useState } from 'react';
import { AuditInput } from '@/lib/audit-engine';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface AuditFormProps {
  onSubmit: (data: AuditInput, hasManualData: boolean) => void;
  isLoading?: boolean;
}

const industries = ['Legal', 'Dental', 'Hotels', 'Real Estate', 'Fintech', 'Other'] as const;

export default function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState<AuditInput['industry']>('Legal');

  const [showReputation, setShowReputation] = useState(false);
  const [showFinancial, setShowFinancial] = useState(false);

  const [avgRating, setAvgRating] = useState('');
  const [totalReviews, setTotalReviews] = useState('');
  const [negativePercent, setNegativePercent] = useState('');
  const [googleRanking, setGoogleRanking] = useState('');
  const [negativePress, setNegativePress] = useState(false);
  const [glassdoor, setGlassdoor] = useState<'none' | 'mild' | 'strong'>('none');
  const [monthlyTraffic, setMonthlyTraffic] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [avgDealValue, setAvgDealValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !location.trim()) return;

    const hasManualReputation = showReputation && (avgRating || totalReviews || negativePercent || googleRanking);

    const data: AuditInput = {
      companyName: companyName.trim(),
      location: location.trim(),
      industry,
      avgRating: avgRating ? parseFloat(avgRating) : 0,
      totalReviews: totalReviews ? parseInt(totalReviews) : 0,
      negativePercent: negativePercent ? parseFloat(negativePercent) : 0,
      googleRanking: googleRanking ? parseInt(googleRanking) : 3,
      negativePress,
      glassdoor,
      monthlyTraffic: monthlyTraffic ? parseInt(monthlyTraffic) : undefined,
      conversionRate: conversionRate ? parseFloat(conversionRate) : undefined,
      avgDealValue: avgDealValue ? parseFloat(avgDealValue) : undefined,
    };

    onSubmit(data, !!hasManualReputation);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Required fields */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Required Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. Smith & Associates LLP"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">City / Country *</Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. New York, NY"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Industry *</Label>
            <Select value={industry} onValueChange={v => setIndustry(v as AuditInput['industry'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Optional Reputation Data */}
      <Collapsible open={showReputation} onOpenChange={setShowReputation}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center justify-between w-full py-3 border-t border-border text-sm hover:text-foreground transition-colors text-muted-foreground">
            <span className="font-medium">Reputation Data <span className="text-xs ml-2 opacity-60">(optional — AI will research if empty)</span></span>
            {showReputation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Avg Rating (0–5)</Label>
              <Input type="number" step="0.1" min="0" max="5" value={avgRating} onChange={e => setAvgRating(e.target.value)} placeholder="e.g. 4.2" />
            </div>
            <div className="space-y-2">
              <Label>Total Reviews</Label>
              <Input type="number" min="0" value={totalReviews} onChange={e => setTotalReviews(e.target.value)} placeholder="e.g. 45" />
            </div>
            <div className="space-y-2">
              <Label>% 1–2 Star Reviews</Label>
              <Input type="number" min="0" max="100" value={negativePercent} onChange={e => setNegativePercent(e.target.value)} placeholder="e.g. 12" />
            </div>
            <div className="space-y-2">
              <Label>Google Ranking (1–10)</Label>
              <Input type="number" min="1" max="10" value={googleRanking} onChange={e => setGoogleRanking(e.target.value)} placeholder="e.g. 3" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Switch checked={negativePress} onCheckedChange={v => setNegativePress(v)} />
              <Label>Negative Press?</Label>
            </div>
            <div className="space-y-2">
              <Label>Glassdoor Negativity</Label>
              <Select value={glassdoor} onValueChange={v => setGlassdoor(v as 'none' | 'mild' | 'strong')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Optional Financial Data */}
      <Collapsible open={showFinancial} onOpenChange={setShowFinancial}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center justify-between w-full py-3 border-t border-border text-sm hover:text-foreground transition-colors text-muted-foreground">
            <span className="font-medium">Financial Data <span className="text-xs ml-2 opacity-60">(optional — AI will estimate if empty)</span></span>
            {showFinancial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Monthly Traffic</Label>
              <Input type="number" min="0" value={monthlyTraffic} onChange={e => setMonthlyTraffic(e.target.value)} placeholder="e.g. 5000" />
            </div>
            <div className="space-y-2">
              <Label>Conversion Rate %</Label>
              <Input type="number" step="0.1" min="0" max="100" value={conversionRate} onChange={e => setConversionRate(e.target.value)} placeholder="e.g. 3.5" />
            </div>
            <div className="space-y-2">
              <Label>Avg Deal Value ($)</Label>
              <Input type="number" min="0" value={avgDealValue} onChange={e => setAvgDealValue(e.target.value)} placeholder="e.g. 2500" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            AI is researching...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Audit
          </span>
        )}
      </Button>
    </form>
  );
}
