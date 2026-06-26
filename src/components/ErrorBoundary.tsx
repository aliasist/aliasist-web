import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex min-h-[8rem] items-center justify-center px-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
            This section could not load. Refresh to try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
