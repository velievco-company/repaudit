import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditResponse, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';
import AuditReport from '@/components/AuditReport';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AuditRow {
  id: string;
  company_name: string;
  score: number | null;
  country: string | null;
  industry: string | null;
  created_at: string | null;
  result: any;
  share_id: string | null;
}

interface Props {
  lang: AppLanguage;
  onBack: () => void;
}

function scoreColor(score: number | null) {
  if (!score) return 'bg-muted text-muted-foreground';
  if (score >= 86) return 'bg-emerald-500/20 text-emerald-400';
  if (score >= 66) return 'bg-green-500/20 text-green-400';
  if (score >= 41) return 'bg-amber-500/20 text-amber-400';
  return 'bg-red-500/20 text-red-400';
}

export default function History({ lang, onBack }: Props) {
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setAudits(data as unknown as AuditRow[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {t(lang, 'history_back')}
        </Button>
        <h1 className="text-2xl font-bold">
          {t(lang, 'history_title')}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : audits.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t(lang, 'history_empty')}</p>
          <Button variant="outline" onClick={onBack}>{t(lang, 'history_first_audit')}</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => (
            <button
              key={audit.id}
              onClick={() => setSelected(audit)}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors text-left"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold font-mono text-lg ${scoreColor(audit.score)}`}>
                {audit.score ?? '—'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{audit.company_name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {audit.created_at ? new Date(audit.created_at).toLocaleDateString() : ''}
                  {audit.country ? ` · ${audit.country}` : ''}
                  {audit.industry ? ` · ${audit.industry}` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background border-border">
          {selected?.result && (
            <AuditReport data={selected.result as AuditResponse} lang={lang} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
