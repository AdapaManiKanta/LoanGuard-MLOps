import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('LoanGuard Error Boundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-blue-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-500 text-sm mb-2">An unexpected error occurred in LoanGuard.</p>
                        <p className="text-xs text-red-400 font-mono bg-red-50 rounded-xl px-4 py-2 mb-8 break-all">
                            {this.state.error?.message || 'Unknown error'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-glow bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-blue-200">
                                🔄 Reload Page
                            </button>
                            <button
                                onClick={() => { localStorage.removeItem('lg_token'); window.location.href = '/'; }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                                🏠 Go Home
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
