'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { authAtom } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useAtom(authAtom);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');

        if (!token) {
          throw new Error('No authentication token received');
        }

        // Handle the OAuth callback
        authService.handleAuthCallback(token, provider || 'google');

        // Fetch user profile
        const user = await authService.getProfile();

        // Update auth state
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Save user data to localStorage
        localStorage.setItem('user_data', JSON.stringify(user));

        setStatus('success');

        // Redirect to playground after a short delay
        setTimeout(() => {
          router.push('/playground');
        }, 2000);

      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to login after error
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, setAuthState, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Authentication</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Completing sign in...'}
            {status === 'success' && 'Sign in successful!'}
            {status === 'error' && 'Sign in failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Please wait while we complete your sign in...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Redirecting you to the playground...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-8 w-8 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-muted-foreground">
                  Redirecting you back to login...
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
