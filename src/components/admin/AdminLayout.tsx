import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Server, 
  Shield,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const sidebarLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/predictions', label: 'Predictions', icon: BarChart3 },
  { href: '/admin/accuracy', label: 'Accuracy', icon: TrendingUp },
  { href: '/admin/system', label: 'System', icon: Server },
];

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Dark Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        {/* Logo Area */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/20">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <span className="text-lg font-bold">Admin Panel</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 p-4">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
