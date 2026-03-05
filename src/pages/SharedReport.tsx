import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuditResponse } from '@/lib/types';
import AuditReport from '@/components/AuditReport';
import { Shield, Loader2 } from 'lucide-react';

export default function SharedReport() {
  const { shareId } = useParams<{ shareId: string }>();
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shareId) return;
    (async () => {
      const { data: audit, error: err } = await supabase
        .from('audits')
        .select('result')
        .eq('share_id', shareId)
        .maybeSingle();
      if (err || !audit) {
        setError('Report not found');
      } else {
        setData(audit.result as unknown as AuditResponse);
      }
      setLoading(false);
    })();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{error || 'Report not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            RepAudit
          </span>
          <span className="text-xs text-muted-foreground ml-2 font-mono">Shared Report</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <AuditReport data={data} lang="en" />
      </main>
    </div>
  );
}
