import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import TradesPage from "@/pages/trades-page";
import JournalPage from "@/pages/journal-page";
import AnalyticsPage from "@/pages/analytics-page";
import CalendarPage from "@/pages/calendar-page";
import SettingsPage from "@/pages/settings-page";

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Something went wrong
          </h1>
          <p className="mb-4">
            We encountered an error while loading AlphaJournal.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  // Remove loading state when route components mount
  useEffect(() => {
    const loadingEl = document.querySelector('.app-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }, []);

  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/trades" component={TradesPage} />
      <ProtectedRoute path="/journal" component={JournalPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Log important diagnostic information for debugging
  useEffect(() => {
    console.log("AlphaJournal app initialized");
    console.log("Environment:", import.meta.env.MODE);
    console.log("Base URL:", import.meta.env.BASE_URL);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
