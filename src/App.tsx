/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { LoginPage } from './components/LoginPage';
import { FoodFixMain } from './components/FoodFixMain';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [authLoading, setAuthLoading] = useState(true);
  const isInitial = useRef(true);

  useEffect(() => {
    // If not configured, wait foruser setup
    if (!isSupabaseConfigured() || !supabase) {
      setAuthLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user?.email);
      }
      setAuthLoading(false);
    });

    // Listen to real-time auth changes (sign-in, sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user?.email);
        if (event === 'SIGNED_IN' && !isInitial.current) {
          // Manual login/signup from this session:
          // Delay transition slightly to allow user to see the beautiful success state/checkmark
          setTimeout(() => {
            setIsAuthenticated(true);
            setAuthLoading(false);
          }, 1100);
        } else {
          // Initial load session or auto-refresh: instantly log in
          setIsAuthenticated(true);
          setAuthLoading(false);
        }
      } else {
        setIsAuthenticated(false);
        setUserEmail(undefined);
        setAuthLoading(false);
      }
      isInitial.current = false;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setUserEmail(undefined);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 font-medium text-sm">Securing terminal session...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="login"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full"
        >
          <LoginPage onLogin={() => setIsAuthenticated(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full"
        >
          <FoodFixMain userEmail={userEmail} onLogout={handleLogout} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
