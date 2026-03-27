'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 * Catches React errors and displays a fallback UI
 * Integrates with Sentry for error tracking
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state
    this.setState({
      error,
      errorInfo,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallbackUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Functional error fallback UI that can use hooks (useLanguage).
 */
function ErrorFallbackUI({
  error,
  errorInfo,
  onReset,
  onReload,
  onGoHome,
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {t('errors.somethingWentWrong')}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {t('errors.weApologize')}
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                {error.toString()}
              </p>
              {errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                    {t('errors.componentStack')}
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}
          <div className="space-y-3">
            <Button onClick={onReset} className="w-full">
              <RefreshCw className="h-4 w-4" />
              {t('errors.tryAgain')}
            </Button>
            <Button variant="secondary" onClick={onReload} className="w-full">
              <RefreshCw className="h-4 w-4" />
              {t('errors.reloadPage')}
            </Button>
            <Button variant="secondary" onClick={onGoHome} className="w-full">
              <Home className="h-4 w-4" />
              {t('errors.goToHomepage')}
            </Button>
          </div>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('errors.ifProblemPersists')}{' '}
            <a href="mailto:support@onekof.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              {t('errors.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Functional wrapper for Error Boundary
 * Easier to use in functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
