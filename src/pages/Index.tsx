import { useState, useRef, useCallback } from 'react';
import AuditForm from '@/components/AuditForm';
import AuditReport from '@/components/AuditReport';
import AnalysisProgress from '@/components/AnalysisProgress';
import { AuditFormInput, AuditResponse, AnalysisStep } from '@/lib/types';
import { ANALYSIS_STEPS } from '@/lib/audit-steps';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Download, Share2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'dossier'>('audit');
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const simulateProgress = useCallback(() => {
    const newSteps = ANALYSIS_STEPS.map(s => ({ ...s }));
    setSteps(newSteps);

    const delays = [800, 2500, 5000, 8000, 12000, 16000];
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setSteps(prev => prev.map((s, j) => ({
          ...s,
          status: j < i ? 'done' as const : j === i ? 'active' as const : 'pending' as const,
        })));
      }, delay);
    });
  }, []);

  const handleSubmit = async (data: AuditFormInput) => {
    setIsLoading(true);
    setResult(null);
    setShowOnboarding(false);
    simulateProgress();

    try {
      const { data: researchData, error } = await supabase.functions.invoke('reputation-research', {
        body: {
          companyName: data.companyName,
          website: data.website,
          country: data.country,
          industry: data.industry,
          timeRange: data.timeRange,
          language: data.language,
          depth: data.depth,
        },
      });

      if (error) throw error;

      // Mark all steps done
      setSteps(prev => prev.map(s => ({ ...s, status: 'done' as const })));
      await new Promise(r => setTimeout(r, 600));

      setResult(researchData as AuditResponse);
      toast.success('Аудит завершён');
    } catch (err) {
      console.error('Research failed:', err);
      setSteps(prev => prev.map((s, i) => ({ ...s, status: i === prev.length - 1 ? 'error' as const : s.status })));
      toast.error('Ошибка при проведении аудита. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>RepAudit</span>
          </div>
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 text-sm font-mono rounded-md transition-colors ${activeTab === 'audit' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Репутационный аудит
            </button>
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-4 py-2 text-sm font-mono rounded-md transition-colors ${activeTab === 'dossier' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Досье компании
            </button>
          </nav>
        </div>
      </header>

      {activeTab === 'audit' ? (
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Onboarding hint */}
          {showOnboarding && !result && !isLoading && (
            <div className="text-center mb-8 py-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Репутационный аудит
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                Введите название компании, и мы проведём полный репутационный аудит за 60 секунд
              </p>
            </div>
          )}

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <AuditForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Progress */}
          {isLoading && (
            <div className="mb-8">
              <AnalysisProgress steps={steps} />
            </div>
          )}

          {/* Results */}
          {result && !isLoading && (
            <>
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
                  <Download className="h-3.5 w-3.5" /> Скачать PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
                  <Share2 className="h-3.5 w-3.5" /> Поделиться
                </Button>
              </div>
              <AuditReport data={result} />
            </>
          )}
        </main>
      ) : (
        /* Dossier Coming Soon */
        <main className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="bg-card border border-border rounded-xl p-12">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Досье компании
            </h2>
            <p className="text-sm text-muted-foreground mb-2 font-mono uppercase tracking-wider">Coming Soon</p>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Полное досье: структура собственности, финансовые показатели, ключевые персоны, история, партнёры и контрагенты.
            </p>
            <Button variant="outline" className="font-mono text-xs" disabled>
              Уведомить меня
            </Button>
          </div>
        </main>
      )}
    </div>
  );
};

export default Index;
