'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export function OAuthProvider({ children }: { children: React.ReactNode }) {
  // Replace with your actual Google Client ID
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
