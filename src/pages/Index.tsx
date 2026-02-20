import { useState } from 'react';
import AuditForm from '@/components/AuditForm';
import AuditReport from '@/components/AuditReport';
import { AuditInput, AuditResult, ProjectionMode, calculateAudit, generateMarkdown, generatePlainText } from '@/lib/audit-engine';
import { DataSource, AIResearchResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Copy, Download, Sparkles } from 'lucide-react';

const Index = () => {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [input, setInput] = useState<AuditInput | null>(null);
  const [mode, setMode] = useState<ProjectionMode>('conservative');
  const [isLoading, setIsLoading] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');

  const handleSubmit = async (data: AuditInput, hasManualData: boolean) => {
    if (!hasManualData) {
      // No manual data — use AI research
      setIsLoading(true);
      try {
        const { data: researchData, error } = await supabase.functions.invoke('reputation-research', {
          body: { companyName: data.companyName, location: data.location, industry: data.industry },
        });

        if (error) throw error;

        const research = researchData as AIResearchResult;
        const sources: DataSource[] = [];

        // Apply AI data to input
        const enriched: AuditInput = { ...data };
        const m = research.metrics;

        enriched.avgRating = m.avgRating.value;
        sources.push({ field: 'avgRating', source: 'ai', confidence: m.avgRating.confidence, comment: m.avgRating.comment });

        enriched.totalReviews = m.totalReviews.value;
        sources.push({ field: 'totalReviews', source: 'ai', confidence: m.totalReviews.confidence, comment: m.totalReviews.comment });

        enriched.negativePercent = m.negativePercent.value;
        sources.push({ field: 'negativePercent', source: 'ai', confidence: m.negativePercent.confidence, comment: m.negativePercent.comment });

        enriched.googleRanking = m.googleRanking.value;
        sources.push({ field: 'googleRanking', source: 'ai', confidence: m.googleRanking.confidence, comment: m.googleRanking.comment });

        enriched.negativePress = m.negativePress.value;
        sources.push({ field: 'negativePress', source: 'ai', confidence: m.negativePress.confidence, comment: m.negativePress.comment });

        enriched.glassdoor = m.glassdoor.value as AuditInput['glassdoor'];
        sources.push({ field: 'glassdoor', source: 'ai', confidence: m.glassdoor.confidence, comment: m.glassdoor.comment });

        enriched.monthlyTraffic = m.monthlyTraffic.value;
        sources.push({ field: 'monthlyTraffic', source: 'ai', confidence: m.monthlyTraffic.confidence, comment: m.monthlyTraffic.comment });

        enriched.conversionRate = m.conversionRate.value;
        sources.push({ field: 'conversionRate', source: 'ai', confidence: m.conversionRate.confidence, comment: m.conversionRate.comment });

        enriched.avgDealValue = m.avgDealValue.value;
        sources.push({ field: 'avgDealValue', source: 'ai', confidence: m.avgDealValue.confidence, comment: m.avgDealValue.comment });

        setDataSources(sources);
        setAiSummary(research.summary || '');
        setInput(enriched);
        setResult(calculateAudit(enriched, mode));
        toast.success('AI research complete — audit generated');
      } catch (err) {
        console.error('AI research failed:', err);
        toast.error('AI research failed. Generating audit with default estimates.');
        // Fallback to local calculation
        setInput(data);
        setResult(calculateAudit(data, mode));
        setDataSources([]);
        setAiSummary('');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Has manual data — use local calculation
      setInput(data);
      setResult(calculateAudit(data, mode));
      setDataSources([]);
      setAiSummary('');
    }
  };

  const handleModeChange = (aggressive: boolean) => {
    const newMode: ProjectionMode = aggressive ? 'aggressive' : 'conservative';
    setMode(newMode);
    if (input) setResult(calculateAudit(input, newMode));
  };

  const copyMarkdown = () => {
    if (!input || !result) return;
    navigator.clipboard.writeText(generateMarkdown(input, result, mode));
    toast.success('Copied as Markdown');
  };

  const copyPlainText = () => {
    if (!input || !result) return;
    navigator.clipboard.writeText(generatePlainText(input, result, mode));
    toast.success('Copied as Plain Text');
  };

  const downloadTxt = () => {
    if (!input || !result) return;
    const text = generatePlainText(input, result, mode);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.companyName.replace(/\s+/g, '_')}_audit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Reputation Audit Engine</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Enter company details to generate a comprehensive reputation analysis. 
            Leave optional fields empty — AI will research the data automatically.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <AuditForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-card border border-border rounded-xl p-12 mb-8 text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium mb-1">AI Research in Progress</p>
            <p className="text-sm text-muted-foreground">Analyzing reputation data, SERP presence, and market positioning...</p>
          </div>
        )}

        {/* Results */}
        {result && input && !isLoading && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-6 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Conservative</Label>
                <Switch checked={mode === 'aggressive'} onCheckedChange={handleModeChange} />
                <Label className="text-xs text-muted-foreground">Aggressive</Label>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={copyMarkdown} className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Markdown
                </Button>
                <Button variant="outline" size="sm" onClick={copyPlainText} className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Plain Text
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTxt} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> .txt
                </Button>
              </div>
            </div>

            {/* Report */}
            <div className="bg-card border border-border rounded-xl p-8">
              <AuditReport input={input} result={result} mode={mode} dataSources={dataSources} aiSummary={aiSummary} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
