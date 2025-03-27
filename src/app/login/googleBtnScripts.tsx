"use client"
import { useEffect } from 'react';

// Adicionar declaração de tipos para o Google Identity API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { 
              credential: string
              select_by: string
              clientId: string
              client_id: string
            }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: { theme: string; size: string }
          ) => void;
        };
      };
    };
  }
}

type GoogleBtnScriptsProps = {
  onLogin: (token: string) => void
}

export default function GoogleBtnScripts({ onLogin }: GoogleBtnScriptsProps) {
  useEffect(() => {
    const initializeGoogle = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: (response) => {
          onLogin(response.credential)
        },
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-login-button'),
        { theme: 'outline', size: 'large' }
      )
    }

    if (window.google) {
      initializeGoogle()
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogle
      document.body.appendChild(script)
    }
  }, [])

  return (
    <>
      <div id="google-login-button" />
      {/* Script da função onSignIn */}
    </>
  );
}
