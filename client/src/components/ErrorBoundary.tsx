import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render() {
    const [, setLocation] = useLocation();

    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-dark-950 to-dark-900 p-4">
          <Card className="w-full max-w-md backdrop-blur-lg border-white/10">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-6">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
              <p className="text-slate-400 mb-6">
                Don't worry, we're on it! Try refreshing the page or going back home.
              </p>
              <button
                className="bg-primary/90 hover:bg-primary text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                onClick={() => {
                  this.setState({ hasError: false });
                  setLocation('/');
                }}
              >
                Return Home
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;