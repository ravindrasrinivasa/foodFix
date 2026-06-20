import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, initializeSupabase } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, Settings2, Info, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

export const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  // Config state (for dynamic setup fallback)
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-redirect if already logged in (checked on mount via App.tsx but added here for redundancy)
  useEffect(() => {
    if (isConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          onLogin();
        }
      });
    }
  }, [isConfigured, onLogin]);

  // Handle saving credentials
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setMessage({ type: 'error', text: 'Please fill in both Supabase fields.' });
      return;
    }

    try {
      // Validate basic format
      const url = supabaseUrlInput.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setMessage({ type: 'error', text: 'Supabase URL must start with http:// or https://' });
        return;
      }

      initializeSupabase(url, supabaseKeyInput.trim());
      setIsConfigured(true);
      setMessage({ type: 'success', text: 'Supabase connected successfully!' });
      setTimeout(() => {
        setMessage(null);
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to initialize Supabase.' });
    }
  };

  // Handle Email & Password Login / Signup
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Please fill out all fields.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase is not initialized correctly.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        // In Supabase, if email confirmation is enabled, they need to verify.
        // We handle session auto-detection if email confirmation is disabled.
        if (data?.session) {
          setMessage({ type: 'success', text: 'Account created successfully! Redirecting to home page...' });
          setTimeout(() => {
            onLogin();
          }, 1100);
        } else {
          setMessage({
            type: 'success',
            text: 'Sign up successful! Please check your email for a confirmation link.',
          });
          // Also set auth to true anyway for a smoother demonstration, or let users login manually.
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        setMessage({ type: 'success', text: 'Logged in successfully! Redirecting you to home page...' });
        setTimeout(() => {
          onLogin();
        }, 1100);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred during authentication.' });
    } finally {
      setLoading(false);
    }
  };

  // Configuration Setup Screen (Fallback helper if details aren't provided in .env yet)
  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-orange-50 rounded-2xl mb-4 text-orange-500">
              <Settings2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Connect Supabase</h1>
            <p className="text-slate-500 text-sm mt-2">
              Provide your project credentials below to unlock secure user sign-ins and accounts.
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-2xl mb-6 text-sm flex gap-3 items-start ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Supabase Project URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full pl-3 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Supabase Anon API Key
              </label>
              <input
                type="text"
                required
                value={supabaseKeyInput}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              Connect & Refresh
            </button>
          </form>

          <div className="bg-slate-50 rounded-2xl p-4 mt-6 border border-slate-100 text-xs text-slate-600 space-y-2">
            <div className="flex gap-2 font-semibold text-slate-700 items-center">
              <Info className="w-4 h-4 text-orange-500" />
              <span>Where can I find these?</span>
            </div>
            <p className="leading-relaxed">
              Open your Supabase Dashboard, head to <strong>Project Settings</strong> &rarr; <strong>API</strong>, and copy your standard <strong>Project URL</strong> and <strong>Anon Public Key</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Proper Tab-based Authentication Sign In/Up Form
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <span className="inline-block text-4xl mb-2">🍔</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Food<span className="text-orange-500">Fix</span> Support
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isSignUp ? 'Create an account to start ordering' : 'Log in safely with Supabase'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setMessage(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${
              !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setMessage(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${
              isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 text-sm flex gap-3 items-start ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <span className="break-words">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to change backend connection details?')) {
                localStorage.removeItem('supabase_project_url');
                localStorage.removeItem('supabase_anon_key');
                setIsConfigured(false);
              }
            }}
            className="text-slate-400 text-xs hover:text-slate-600 transition flex items-center justify-center gap-1.5 mx-auto"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Reset Connection Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
