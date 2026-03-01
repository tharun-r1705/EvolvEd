import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/api.js';

/**
 * Landing page for Supabase OAuth redirects.
 * Supabase appends a code/fragment to this URL after Google / LinkedIn login.
 * We exchange it for a session, then POST the Supabase access_token to our
 * backend, get back our own JWT, and redirect to the dashboard.
 */
export default function OAuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function handleCallback() {
      try {
        // Supabase handles the code → session exchange automatically when the
        // page loads (it reads the URL hash/code internally).
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.error('OAuth session error:', error?.message);
          navigate('/login?error=oauth_failed', { replace: true });
          return;
        }

        const supabaseToken = data.session.access_token;

        // Determine intended role from the query param set before redirect
        // (stored in sessionStorage by the login page)
        const role = sessionStorage.getItem('oauth_role') || 'student';
        sessionStorage.removeItem('oauth_role');

        // Exchange Supabase token for our custom JWT
        const res = await authService.oauthCallback(supabaseToken, role);
        const { token, role: userRole, user } = res.data;

        login(token, userRole, user);

        if (userRole === 'student') navigate('/student', { replace: true });
        else if (userRole === 'recruiter') navigate('/recruiter', { replace: true });
        else if (userRole === 'admin') navigate('/admin', { replace: true });
        else navigate('/', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        navigate('/login?error=oauth_failed', { replace: true });
      }
    }

    handleCallback();
  }, [login, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-navy text-lg font-semibold">Signing you in…</p>
        <p className="text-charcoal/60 text-sm">Just a moment while we verify your account.</p>
      </div>
    </div>
  );
}
