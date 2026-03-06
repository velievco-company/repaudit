import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Mail, Lock, Loader2, Eye, EyeOff, User, Building2, Briefcase, Globe, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Mode = 'login' | 'signup' | 'reset';

const JOB_TITLES = [
  { value: 'ceo', label: 'CEO / Founder' },
  { value: 'cmo', label: 'CMO / Marketing' },
  { value: 'pr', label: 'PR Manager' },
  { value: 'investor', label: 'Investor' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'other', label: 'Other' },
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1–10' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '200+', label: '200+' },
];

const Auth = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  // Signup-only fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) { toast.error('Enter your email'); return; }
    if (mode !== 'reset' && !password.trim()) { toast.error('Enter your password'); return; }
    if (mode !== 'reset' && password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (mode === 'signup') {
      if (!fullName.trim()) { toast.error('Enter your full name'); return; }
      if (!companyName.trim()) { toast.error('Enter your company name'); return; }
      if (!jobTitle) { toast.error('Select your job title'); return; }
      if (!companySize) { toast.error('Select company size'); return; }
      if (!country.trim()) { toast.error('Enter your country'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          if (error.message.includes('Invalid login') || error.message.includes('invalid_credentials')) {
            toast.error('Invalid email or password');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Please confirm your email first. Check your inbox.');
          } else if (error.message.includes('Too many requests')) {
            toast.error('Too many attempts. Wait a few minutes and try again.');
          } else {
            toast.error('Login failed. Please try again.');
          }
          return;
        }
        if (data.user) toast.success('Welcome back!');
      } else if (mode === 'signup') {
        const { data: signupData, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) {
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            toast.error('This email is already registered. Try signing in.');
          } else {
            toast.error('Registration failed. Please try again.');
          }
          return;
        }
        // Save profile data
        if (signupData.user) {
          await supabase.from('profiles').upsert({
            id: signupData.user.id,
            email: email.trim(),
            full_name: fullName.trim(),
            company_name: companyName.trim(),
            job_title: jobTitle,
            company_size: companySize,
            country: country.trim(),
          } as any);
        }
        setSignupDone(true);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) { toast.error('Could not send reset email.'); return; }
        toast.success('Password reset link sent. Check your email.');
        setMode('login');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (signupDone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>RepAudit</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <button onClick={() => { setSignupDone(false); setMode('login'); }} className="text-sm text-primary hover:underline">
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className={`w-full ${mode === 'signup' ? 'max-w-lg' : 'max-w-sm'}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>RepAudit</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="you@example.com" autoComplete="email" className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          {/* Password */}
          {mode !== 'reset' && (
            <div className="mb-4">
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="w-full bg-background border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Signup-only fields */}
          {mode === 'signup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Company *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc." className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Job Title *</label>
                <Select value={jobTitle} onValueChange={setJobTitle}>
                  <SelectTrigger className="bg-background border-border h-[42px]">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TITLES.map(j => <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Company Size *</label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger className="bg-background border-border h-[42px]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select size" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Country *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="United States" className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right mb-4">
              <button onClick={() => setMode('reset')} className="text-xs text-muted-foreground hover:text-primary transition-colors">Forgot password?</button>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>No account?{' '}<button onClick={() => setMode('signup')} className="text-primary hover:underline">Sign up free</button></>
            ) : (
              <>Already have an account?{' '}<button onClick={() => setMode('login')} className="text-primary hover:underline">Sign in</button></>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 font-mono">5 audits per day on free tier</p>
      </div>
    </div>
  );
};

export default Auth;
