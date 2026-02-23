import { useState } from 'react';
import { AuditFormInput } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface AuditFormProps {
  onSubmit: (data: AuditFormInput) => void;
  isLoading?: boolean;
}

export default function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState<AuditFormInput['timeRange']>('12');
  const [language, setLanguage] = useState<AuditFormInput['language']>('all');
  const [depth, setDepth] = useState<AuditFormInput['depth']>('standard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    onSubmit({
      companyName: companyName.trim(),
      website: website.trim() || undefined,
      country: country.trim() || undefined,
      industry: industry.trim() || undefined,
      timeRange,
      language,
      depth,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="company" className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
            Название компании *
          </Label>
          <Input
            id="company"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Введите название компании"
            required
            className="h-12 text-base bg-background border-border/50 focus:border-primary"
          />
        </div>
        <div className="flex gap-3">
          <div className="space-y-2 flex-1 md:w-48">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Сайт</Label>
            <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="example.com" className="h-12 bg-background border-border/50" />
          </div>
          <div className="space-y-2 flex-1 md:w-40">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Страна</Label>
            <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Россия" className="h-12 bg-background border-border/50" />
          </div>
          <div className="space-y-2 flex-1 md:w-40">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Отрасль</Label>
            <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Финтех" className="h-12 bg-background border-border/50" />
          </div>
        </div>
      </div>

      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wider">
            Параметры анализа
            {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">Период</Label>
              <Select value={timeRange} onValueChange={v => setTimeRange(v as AuditFormInput['timeRange'])}>
                <SelectTrigger className="w-36 bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 месяца</SelectItem>
                  <SelectItem value="6">6 месяцев</SelectItem>
                  <SelectItem value="12">12 месяцев</SelectItem>
                  <SelectItem value="24">24 месяца</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">Язык</Label>
              <Select value={language} onValueChange={v => setLanguage(v as AuditFormInput['language'])}>
                <SelectTrigger className="w-36 bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="all">Все языки</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">Глубина</Label>
              <Select value={depth} onValueChange={v => setDepth(v as AuditFormInput['depth'])}>
                <SelectTrigger className="w-36 bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Базовый</SelectItem>
                  <SelectItem value="standard">Стандартный</SelectItem>
                  <SelectItem value="deep">Глубокий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={isLoading || !companyName.trim()}>
        <Search className="h-4 w-4" />
        Запустить аудит
      </Button>
    </form>
  );
}
