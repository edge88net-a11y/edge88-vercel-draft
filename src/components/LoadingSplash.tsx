import { Zap } from 'lucide-react';

export function LoadingSplash() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-glow opacity-50" />
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />

      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl">
            <Zap className="h-10 w-10 text-white" />
          </div>
          {/* Pulse Ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent animate-ping opacity-20" />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Edge<span className="gradient-text">88</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-muted-foreground text-sm mb-8">AI-Powered Sports Predictions</p>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-loading-bar" />
        </div>

        {/* Loading Text */}
        <p className="mt-4 text-xs text-muted-foreground animate-pulse">
          Loading your edge...
        </p>
      </div>
    </div>
  );
}
