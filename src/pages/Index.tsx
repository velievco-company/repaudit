import { useState } from 'react';
import AuditForm from '@/components/AuditForm';
import AuditReport from '@/components/AuditReport';
import { AuditInput, AuditResult, ProjectionMode, calculateAudit, generateMarkdown, generatePlainText } from '@/lib/audit-engine';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Index = () => {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [input, setInput] = useState<AuditInput | null>(null);
  const [mode, setMode] = useState<ProjectionMode>('conservative');

  const handleSubmit = (data: AuditInput) => {
    setInput(data);
    setResult(calculateAudit(data, mode));
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Reputation Audit Tool</h1>
          <p className="text-sm text-muted-foreground">Enter company data to generate a structured reputation analysis</p>
        </div>

        <div className="bg-card border border-border rounded-md p-6 mb-6">
          <AuditForm onSubmit={handleSubmit} />
        </div>

        {result && input && (
          <>
            <div className="flex flex-wrap items-center gap-4 mb-4 bg-card border border-border rounded-md p-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Conservative</Label>
                <Switch checked={mode === 'aggressive'} onCheckedChange={handleModeChange} />
                <Label className="text-sm">Aggressive</Label>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={copyMarkdown}>Copy Markdown</Button>
                <Button variant="outline" size="sm" onClick={copyPlainText}>Copy Plain Text</Button>
                <Button variant="outline" size="sm" onClick={downloadTxt}>Download .txt</Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-md p-6">
              <AuditReport input={input} result={result} mode={mode} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
