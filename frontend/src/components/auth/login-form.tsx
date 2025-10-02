'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleLoginButton } from './google-login-button';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Welcome to AI Playground</CardTitle>
        <CardDescription className="text-center">
          Sign in with your Google account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <GoogleLoginButton onSuccess={onSuccess} />
          
          <div className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </CardContent>
    </Card>
  );
}