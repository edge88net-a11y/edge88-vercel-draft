import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative text-center max-w-lg">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-black leading-none gradient-text-animated">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 animate-pulse">
          <Search className="h-10 w-10 text-primary" />
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like this play got intercepted. The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button size="lg" className="btn-gradient gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link to="/predictions">
            <Button size="lg" variant="outline" className="gap-2">
              <Zap className="h-4 w-4" />
              View Predictions
            </Button>
          </Link>
        </div>

        {/* Fun Stats */}
        <div className="mt-12 glass-card p-6 text-left">
          <p className="text-sm text-muted-foreground mb-3">While you're here, did you know...</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span>Our AI analyzes 10,000+ data points per game</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span>We've helped 10,000+ analysts find their edge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span>64.8% overall accuracy across all sports</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <button 
          onClick={() => window.history.back()} 
          className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back to previous page
        </button>
      </div>
    </div>
  );
};

export default NotFound;
