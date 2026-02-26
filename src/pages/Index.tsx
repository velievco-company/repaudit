import { useState, useCallback, useEffect } from 'react';
import AuditForm from '@/components/AuditForm';
import AuditReport from '@/components/AuditReport';
import AnalysisProgress from '@/components/AnalysisProgress';
import { AuditFormInput, AuditResponse, AnalysisStep, AppLanguage } from '@/lib/types';
import { ANALYSIS_STEPS } from '@/lib/audit-steps';
import { t } from '@/lib/i18n';
import { copyMarkdownToClipboard, downloadMarkdown } from '@/lib/export-markdown';
import { exportToPDF } from '@/lib/export-pdf';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Download, Share2, Shield, FileText, Copy, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Session } from '@supabase/supabase-js';

const LANG_OPTIONS: { value: AppLanguage; flag: string; label: string }[] = [
  { value: 'en', flag: '🇬🇧', label: 'EN' },
  { value: 'ru', flag: '🇷🇺', label: 'RU' },
  { value: 'es', flag: '🇪🇸', label: 'ES' },
];

const Index = () => {
  const [lang, setLang] = useState<AppLanguage>('en');
  const [activeTab, setActiveTab] = useState<'audit' | 'dossier'>('audit');
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
  };

  const simulateProgress = useCallback(() => {
    const newSteps = ANALYSIS_STEPS.map(s => ({ ...s }));
    setSteps(newSteps);
    const delays = [800, 3000, 6000, 10000, 14000, 18000, 22000, 28000, 34000, 40000, 48000];
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
          companyName:      data.companyName,
          website:          data.website,
          country:          data.country,
          industry:         data.industry,
          timeRange:        data.timeRange,
          language:         data.language,
          depth:            data.depth,
          targetAudience:   data.targetAudience,
          companyStage:     data.companyStage,
          knownCompetitors: data.knownCompetitors,
          ltv:              data.ltv,
          cac:              data.cac,
          retentionRate:    data.retentionRate,
          additionalContext: data.additionalContext,
        },
      });

      if (error) throw error;

      setSteps(prev => prev.map(s => ({ ...s, status: 'done' as const })));
      await new Promise(r => setTimeout(r, 600));
      const auditResult = researchData as AuditResponse;
      setResult(auditResult);
      toast.success(t(lang, 'audit_done'));

      // Save audit to database
      if (session?.user?.id) {
        const { error: saveErr } = await supabase.from('audits').insert({
          user_id: session.user.id,
          company_name: data.companyName,
          country: data.country || null,
          industry: data.industry || null,
          result: auditResult as any,
          score: auditResult.overall_score ?? null,
        });
        if (saveErr) console.error('Failed to save audit:', saveErr);
      }
    } catch (err) {
      console.error('Research failed:', err);
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i === prev.length - 1 ? 'error' as const : s.status,
      })));
      toast.error(t(lang, 'audit_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMd = async () => {
    if (!result) return;
    await copyMarkdownToClipboard(result);
    toast.success(t(lang, 'copied'));
  };
  const handleDownloadMd  = () => { if (result) downloadMarkdown(result); };
  const handleDownloadPdf = () => { if (result) exportToPDF(result); };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">

        {/* Nav */}
        <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t(lang, 'app_name')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tabs */}
              <nav className="flex gap-1 mr-1">
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-2 text-sm font-mono rounded-md transition-colors ${activeTab === 'audit' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t(lang, 'nav_audit')}
                </button>
                <button
                  onClick={() => setActiveTab('dossier')}
                  className={`px-4 py-2 text-sm font-mono rounded-md transition-colors ${activeTab === 'dossier' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t(lang, 'nav_dossier')}
                </button>
              </nav>

              {/* Language switcher */}
              <div className="flex items-center gap-0.5 bg-secondary/50 rounded-lg p-0.5">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLang(opt.value)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
                      lang === opt.value
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.flag} {opt.label}
                  </button>
                ))}
              </div>

              {/* User info + sign out */}
              {session && (
                <div className="flex items-center gap-2 ml-1 pl-2 border-l border-border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono cursor-default">
                        <User className="h-3.5 w-3.5" />
                        <span className="max-w-[120px] truncate hidden sm:block">
                          {session.user.email}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{session.user.email}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleSignOut}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Sign out</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        {activeTab === 'audit' ? (
          <main className="max-w-6xl mx-auto px-6 py-8">

            {showOnboarding && !result && !isLoading && (
              <div className="text-center mb-8 py-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t(lang, 'onboarding_title')}
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                  {t(lang, 'onboarding_sub')}
                </p>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <AuditForm onSubmit={handleSubmit} isLoading={isLoading} lang={lang} />
            </div>

            {isLoading && (
              <div className="mb-8">
                <AnalysisProgress steps={steps} lang={lang} />
              </div>
            )}

            {result && !isLoading && (
              <>
                <div className="flex flex-wrap justify-end gap-2 mb-4">
                  <Button variant="outline" size="sm" className="gap-2 font-mono text-xs" onClick={handleCopyMd}>
                    <Copy className="h-3.5 w-3.5" /> {t(lang, 'btn_copy_md')}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 font-mono text-xs" onClick={handleDownloadMd}>
                    <FileText className="h-3.5 w-3.5" /> {t(lang, 'btn_download_md')}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 font-mono text-xs" onClick={handleDownloadPdf}>
                    <Download className="h-3.5 w-3.5" /> {t(lang, 'btn_download_pdf')}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 font-mono text-xs" disabled>
                    <Share2 className="h-3.5 w-3.5" /> {t(lang, 'btn_share')}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 font-mono text-xs opacity-50 cursor-not-allowed" disabled>
                        {t(lang, 'btn_gamma')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Coming soon</TooltipContent>
                  </Tooltip>
                </div>
                <AuditReport data={result} lang={lang} />
              </>
            )}
          </main>
        ) : (
          <main className="max-w-3xl mx-auto px-6 py-24 text-center">
            <div className="bg-card border border-border rounded-xl p-12">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t(lang, 'dossier_title')}
              </h2>
              <p className="text-sm text-muted-foreground mb-2 font-mono uppercase tracking-wider">
                {t(lang, 'dossier_coming')}
              </p>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm leading-relaxed">
                {t(lang, 'dossier_desc')}
              </p>
              <Button variant="outline" className="font-mono text-xs" disabled>
                {t(lang, 'dossier_notify')}
              </Button>
            </div>
          </main>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Index;
