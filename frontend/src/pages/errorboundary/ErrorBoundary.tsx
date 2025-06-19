import {Component, type ErrorInfo, type ReactNode} from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {hasError: true, error};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console or error reporting service
        console.error('Error Boundary caught an error:', error, errorInfo);

        // You can also log to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '8px',
                    margin: '20px'
                }}>
                    <h2>Something went wrong</h2>
                    <p>We're sorry, but something unexpected happened.</p>
                    <details style={{whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '10px'}}>
                        <summary>Error details</summary>
                        {this.state.error?.toString()}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}