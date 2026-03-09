import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, XCircle, Loader2, RefreshCw, Search, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'velievco@gmail.com';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  job_title: string | null;
  company_size: string | null;
  country: string | null;
  created_at: string | null;
  status: 'pending' | 'approved' | 'rejected';
  audits_count: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? '';
      if (email === ADMIN_EMAIL) { setIsAdmin(true); fetchUsers(); }
      else setLoading(false);
    });
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: auditCounts } = await supabase.from('audits').select('user_id');
    const countMap: Record<string, number> = {};
    auditCounts?.forEach((a: any) => { if (a.user_id) countMap[a.user_id] = (countMap[a.user_id] ?? 0) + 1; });
    setUsers((profiles ?? []).map((p: any) => ({
      id: p.id, email: p.email ?? '', full_name: p.full_name ?? null,
      company_name: p.company_name ?? null, job_title: p.job_title ?? null,
      company_size: p.company_size ?? null, country: p.country ?? null,
      created_at: p.created_at ?? null, status: p.status ?? 'pending',
      audits_count: countMap[p.id] ?? 0,
    })));
    setLoading(false);
  };

  const act = async (userId: string, action: 'approve' | 'reject') => {
    setActing(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('approve-user', {
        body: { action, userId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: action === 'approve' ? 'approved' : 'rejected' } : u));
      toast.success(action === 'approve' ? 'User approved — email sent' : 'User rejected');
    } catch {
      toast.error('Action failed');
    } finally {
      setActing(null);
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center"><XCircle className="h-10 w-10 text-destructive mx-auto mb-3" /><p className="text-muted-foreground">Access denied</p></div>
      </div>
    );
  }

  const filtered = users
    .filter(u => filter === 'all' || u.status === filter)
    .filter(u => !search || u.email.includes(search) || (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || (u.company_name ?? '').toLowerCase().includes(search.toLowerCase()));

  const counts = { pending: users.filter(u => u.status === 'pending').length, approved: users.filter(u => u.status === 'approved').length, rejected: users.filter(u => u.status === 'rejected').length };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">RepAudit Admin</h1>
              <p className="text-xs text-muted-foreground font-mono">User approvals</p>
            </div>
          </div>
          <button onClick={fetchUsers} className="flex items-center gap-2 text-xs border border-border/50 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: users.length, color: '', key: 'all' },
            { label: 'Pending', value: counts.pending, color: 'text-yellow-500', key: 'pending' },
            { label: 'Approved', value: counts.approved, color: 'text-green-500', key: 'approved' },
            { label: 'Rejected', value: counts.rejected, color: 'text-red-500', key: 'rejected' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key as any)}
              className={`bg-card border rounded-lg p-4 text-left transition-colors ${filter === s.key ? 'border-primary' : 'border-border hover:border-border/80'}`}>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, name or company..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No users found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {['User', 'Company', 'Role', 'Country', 'Audits', 'Registered', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className={`border-b border-border/40 hover:bg-muted/10 ${i % 2 ? 'bg-muted/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.full_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{u.company_name || '—'}</div>
                      {u.company_size && <div className="text-xs text-muted-foreground">{u.company_size}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{u.job_title || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{u.country || '—'}</td>
                    <td className="px-4 py-3 font-mono text-center">{u.audits_count}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {u.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full"><Clock className="h-3 w-3" /> Pending</span>
                      )}
                      {u.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Approved</span>
                      )}
                      {u.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3" /> Rejected</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.status === 'pending' && u.email !== ADMIN_EMAIL && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => act(u.id, 'approve')} disabled={acting === u.id}
                            className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
                            {acting === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Approve
                          </button>
                          <button onClick={() => act(u.id, 'reject')} disabled={acting === u.id}
                            className="inline-flex items-center gap-1 text-xs bg-red-600/80 text-white px-2.5 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
                            <XCircle className="h-3 w-3" /> Reject
                          </button>
                        </div>
                      )}
                      {u.status !== 'pending' && <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
