import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Clearasist ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <div className="max-w-md text-center">
              <h1 className="text-2xl font-semibold mb-4">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                Clearasist ran into an unexpected error. Please refresh the page and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-lg bg-electric text-[#0F1117] font-medium hover:bg-white transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
