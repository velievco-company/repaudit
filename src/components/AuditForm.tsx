import { useState } from 'react';
import { AuditFormInput, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface AuditFormProps {
  onSubmit: (data: AuditFormInput) => void;
  isLoading?: boolean;
  lang: AppLanguage;
}

export default function AuditForm({ onSubmit, isLoading, lang }: AuditFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const [timeRange, setTimeRange] = useState<AuditFormInput['timeRange']>('12');
  const [language, setLanguage] = useState<AuditFormInput['language']>('all');
  const [depth, setDepth] = useState<AuditFormInput['depth']>('standard');

  // Extended fields
  const [targetAudience, setTargetAudience] = useState('');
  const [companyStage, setCompanyStage] = useState<AuditFormInput['companyStage']>(undefined);
  const [knownCompetitors, setKnownCompetitors] = useState('');
  const [ltv, setLtv] = useState('');
  const [cac, setCac] = useState('');
  const [retentionRate, setRetentionRate] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

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
      targetAudience: targetAudience.trim() || undefined,
      companyStage,
      knownCompetitors: knownCompetitors.trim() || undefined,
      ltv: ltv ? parseFloat(ltv) : undefined,
      cac: cac ? parseFloat(cac) : undefined,
      retentionRate: retentionRate ? parseFloat(retentionRate) : undefined,
      additionalContext: additionalContext.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Primary row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="company" className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
            {t(lang, 'form_company')}
          </Label>
          <Input
            id="company"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder={t(lang, 'form_company_placeholder')}
            required
            className="h-12 text-base bg-background border-border/50 focus:border-primary"
          />
        </div>
        <div className="flex gap-3">
          <div className="space-y-2 flex-1 md:w-48">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">{t(lang, 'form_website')}</Label>
            <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="example.com" className="h-12 bg-background border-border/50" />
          </div>
          <div className="space-y-2 flex-1 md:w-40">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">{t(lang, 'form_country')}</Label>
            <Input value={country} onChange={e => setCountry(e.target.value)} placeholder={t(lang, 'form_country_placeholder')} className="h-12 bg-background border-border/50" />
          </div>
          <div className="space-y-2 flex-1 md:w-40">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">{t(lang, 'form_industry')}</Label>
            <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder={t(lang, 'form_industry_placeholder')} className="h-12 bg-background border-border/50" />
          </div>
        </div>
      </div>

      {/* Analysis params */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wider">
            {t(lang, 'form_analysis_params')}
            {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_period')}</Label>
              <Select value={timeRange} onValueChange={v => setTimeRange(v as AuditFormInput['timeRange'])}>
                <SelectTrigger className="w-36 bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">{t(lang, 'form_period_3')}</SelectItem>
                  <SelectItem value="6">{t(lang, 'form_period_6')}</SelectItem>
                  <SelectItem value="12">{t(lang, 'form_period_12')}</SelectItem>
                  <SelectItem value="24">{t(lang, 'form_period_24')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_lang')}</Label>
              <Select value={language} onValueChange={v => setLanguage(v as AuditFormInput['language'])}>
                <SelectTrigger className="w-36 bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">{t(lang, 'form_lang_ru')}</SelectItem>
                  <SelectItem value="en">{t(lang, 'form_lang_en')}</SelectItem>
                  <SelectItem value="es">{t(lang, 'form_lang_es')}</SelectItem>
                  <SelectItem value="all">{t(lang, 'form_lang_all')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_depth')}</Label>
              <Select value={depth} onValueChange={v => setDepth(v as AuditFormInput['depth'])}>
                <SelectTrigger className="w-36 bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">{t(lang, 'form_depth_basic')}</SelectItem>
                  <SelectItem value="standard">{t(lang, 'form_depth_standard')}</SelectItem>
                  <SelectItem value="deep">{t(lang, 'form_depth_deep')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Extended profile */}
      <Collapsible open={showExtended} onOpenChange={setShowExtended}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wider">
            {t(lang, 'form_extended_profile')}
            {showExtended ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_target_audience')}</Label>
              <Input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder={t(lang, 'form_target_placeholder')} className="bg-background border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_stage')}</Label>
              <Select value={companyStage ?? ''} onValueChange={v => setCompanyStage(v as AuditFormInput['companyStage'])}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-seed">{t(lang, 'form_stage_preseed')}</SelectItem>
                  <SelectItem value="seed">{t(lang, 'form_stage_seed')}</SelectItem>
                  <SelectItem value="series-a">{t(lang, 'form_stage_seriesa')}</SelectItem>
                  <SelectItem value="growth">{t(lang, 'form_stage_growth')}</SelectItem>
                  <SelectItem value="public">{t(lang, 'form_stage_public')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_competitors')}</Label>
              <Input value={knownCompetitors} onChange={e => setKnownCompetitors(e.target.value)} placeholder={t(lang, 'form_competitors_placeholder')} className="bg-background border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_ltv')}</Label>
              <Input type="number" value={ltv} onChange={e => setLtv(e.target.value)} placeholder="180" className="bg-background border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_cac')}</Label>
              <Input type="number" value={cac} onChange={e => setCac(e.target.value)} placeholder="40" className="bg-background border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_retention')}</Label>
              <Input type="number" value={retentionRate} onChange={e => setRetentionRate(e.target.value)} placeholder="65" className="bg-background border-border/50" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs text-muted-foreground font-mono">{t(lang, 'form_context')}</Label>
              <Textarea
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                placeholder={t(lang, 'form_context_placeholder')}
                className="bg-background border-border/50 resize-none"
                rows={3}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={isLoading || !companyName.trim()}>
        <Search className="h-4 w-4" />
        {t(lang, 'form_submit')}
      </Button>
    </form>
  );
}
