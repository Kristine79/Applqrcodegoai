'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      let errorStack = '';
      
      try {
        if (this.state.error) {
          errorMessage = this.state.error.message;
          errorStack = this.state.error.stack || '';
        }
        
        const parsed = JSON.parse(this.state.error?.message || '{}');
        if (parsed.error) {
          errorMessage = `Firestore Error: ${parsed.error}`;
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 text-center">
          <div className="max-w-2xl w-full glass-card p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-apple-red/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            <div className="w-16 h-16 bg-apple-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-apple-red/20 shadow-xl">
              <AlertTriangle className="w-8 h-8 text-apple-red" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Ошибка приложения</h2>
            <p className="text-white/60 mb-6 leading-relaxed font-medium text-sm">
              {errorMessage}
            </p>

            {errorStack && (
              <div className="mb-8 p-4 bg-black/40 rounded-xl border border-white/5 text-left overflow-x-auto">
                <p className="text-[10px] font-mono text-white/30 uppercase mb-2 tracking-widest">Stack Trace</p>
                <pre className="text-[10px] font-mono text-apple-red/70 whitespace-pre-wrap break-all">
                  {errorStack}
                </pre>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white py-4 px-6 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Обновить страницу
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 red-gradient text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
