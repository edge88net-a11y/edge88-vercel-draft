import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";

// Layouts
import { AppLayout } from "@/components/layout/AppLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";

// Public Pages (use PublicLayout with Navbar/Footer)
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ResponsibleGambling from "./pages/ResponsibleGambling";
import NotFound from "./pages/NotFound";

// App Pages (use AppLayout with Sidebar) - these are the refactored versions
import DashboardPage from "./pages/app/DashboardPage";
import PredictionsPage from "./pages/app/PredictionsPage";
import ResultsPage from "./pages/app/ResultsPage";
import PredictionDetail from "./pages/PredictionDetail";
import SavedPicks from "./pages/SavedPicks";
import Settings from "./pages/Settings";
import Referral from "./pages/Referral";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";

// Admin pages
import AdminOverview from "./pages/admin/AdminOverview";
import AdminPredictions from "./pages/admin/AdminPredictions";
import AdminAccuracy from "./pages/admin/AdminAccuracy";
import AdminSystem from "./pages/admin/AdminSystem";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              {/* Public routes - uses PublicLayout with Navbar/Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/responsible-gambling" element={<ResponsibleGambling />} />
              </Route>

              {/* App routes - uses AppLayout with Sidebar (protected) */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/predictions" element={<PredictionsPage />} />
                <Route path="/predictions/:id" element={<PredictionDetail />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/saved-picks" element={<SavedPicks />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/referral" element={<Referral />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogArticle />} />
              </Route>

              {/* Admin routes - protected by AdminRoute */}
              <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/predictions" element={<AdminPredictions />} />
                <Route path="/admin/accuracy" element={<AdminAccuracy />} />
                <Route path="/admin/system" element={<AdminSystem />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
