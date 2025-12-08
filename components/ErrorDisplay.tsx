'use client';

import { AlertTriangle, WifiOff, ServerCrash, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  type?: 'network' | 'server' | 'not-found' | 'generic';
  onRetry?: () => void;
  showHomeButton?: boolean;
  fullScreen?: boolean;
}

export default function ErrorDisplay({
  title,
  message,
  type = 'generic',
  onRetry,
  showHomeButton = true,
  fullScreen = false,
}: ErrorDisplayProps) {
  const router = useRouter();

  const errorConfig = {
    network: {
      icon: WifiOff,
      defaultTitle: 'Connection Error',
      defaultMessage: 'Please check your internet connection and try again.',
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    server: {
      icon: ServerCrash,
      defaultTitle: 'Server Error',
      defaultMessage: 'Something went wrong on our end. Please try again later.',
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    'not-found': {
      icon: AlertTriangle,
      defaultTitle: 'Not Found',
      defaultMessage: 'The content you are looking for does not exist.',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    generic: {
      icon: AlertTriangle,
      defaultTitle: 'Something went wrong',
      defaultMessage: 'An unexpected error occurred. Please try again.',
      iconColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    },
  };

  const config = errorConfig[type];
  const Icon = config.icon;

  const content = (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8">
      <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title || config.defaultTitle}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {message || config.defaultMessage}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}

        {showHomeButton && (
          <button
            onClick={() => router.push('/feed')}
            className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Compact inline error for lists
export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <span className="text-sm text-red-800 dark:text-red-200">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 dark:text-red-400 hover:underline font-semibold"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({
  icon: Icon = AlertTriangle,
  title,
  message,
  action,
  actionLabel,
}: {
  icon?: any;
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {message}
      </p>

      {action && actionLabel && (
        <button
          onClick={action}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}