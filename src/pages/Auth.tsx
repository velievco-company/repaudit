import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'login' | 'signup' | 'reset';

const Auth = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { toast.error('Enter your email'); return; }
    if (mode !== 'reset' && !password.trim()) { toast.error('Enter your password'); return; }
    if (mode !== 'reset' && password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          console.error('Login error:', error.message);
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
        if (data.user) {
          toast.success('Welcome back!');
        }
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });
        if (error) {
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            toast.error('This email is already registered. Try signing in.');
          } else {
            toast.error('Registration failed. Please try again.');
          }
          return;
        }
        setSignupDone(true);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) {
          toast.error('Could not send reset email. Please try again.');
          return;
        }
        toast.success('Password reset link sent. Check your email.');
        setMode('login');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Signup success screen
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
              We sent a confirmation link to <strong>{email}</strong>.
              Click it to activate your account.
            </p>
            <button
              onClick={() => { setSignupDone(false); setMode('login'); }}
              className="text-sm text-primary hover:underline"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              RepAudit
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'  ? 'Sign in to your account' :
             mode === 'signup' ? 'Create your account' :
             'Reset your password'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">

          <div className="mb-4">
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="mb-4">
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right mb-4">
              <button
                onClick={() => setMode('reset')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login'  ? 'Sign In' :
             mode === 'signup' ? 'Create Account' :
             'Send Reset Link'}
          </button>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                No account?{' '}
                <button onClick={() => setMode('signup')} className="text-primary hover:underline">
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-primary hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
          5 audits per day on free tier
        </p>

      </div>
    </div>
  );
};

export default Auth;
