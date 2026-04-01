import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

/**
 * Generic Error Boundary component to catch JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    // Log the stack trace for debugging
    console.error('Full error stack:', error?.stack);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI if provided, otherwise render default error message
      const FallbackComponent = this.props.fallback || DefaultFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface DefaultFallbackProps {
  error?: Error;
}

const DefaultFallback: React.FC<DefaultFallbackProps> = ({ error }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
    <h2 className="text-lg font-semibold">Something went wrong</h2>
    {error && <p className="mt-2 text-sm">{error.message}</p>}
    <button
      className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      onClick={() => window.location.reload()}
    >
      Reload Page
    </button>
  </div>
);

export default ErrorBoundary;