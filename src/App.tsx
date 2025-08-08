
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

// Import pages and components
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Products } from "@/pages/Products";
import { Sales } from "@/pages/Sales";
import { Inventory } from "@/pages/Inventory";
import { Financial } from "@/pages/Financial";
import { Reports } from "@/pages/Reports";
import { Suppliers } from "@/pages/Suppliers";
import { Customers } from "@/pages/Customers";
import { Users } from "@/pages/Users";
import { Settings } from "@/pages/Settings";
import { PromptGeneratorDashboard } from "@/components/Admin/PromptGenerator/PromptGeneratorDashboard";
import { CommandPalette } from "@/components/ui/command-palette";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { Layout } from "@/components/layout/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { open, setOpen } = useCommandPalette();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/prompt-generator" element={<PromptGeneratorDashboard />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <CommandPalette open={open} onOpenChange={setOpen} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
