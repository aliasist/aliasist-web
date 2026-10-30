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
        <div className="flex min-h-[8rem] flex-col items-center justify-center gap-4 px-4" role="alert">
          <p className="text-sm text-muted-foreground">
            This part of the page didn't load. Reloading usually fixes it.
          </p>
          <button type="button" className="rounded border border-border px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2" onClick={() => window.location.reload()}>
            Reload page
          </button>
          <a href="/" className="text-sm underline">Back to Aliasist</a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
