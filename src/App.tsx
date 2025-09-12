
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Authprovider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CapabilitiesPage from "./pages/CapabilitiesPage";
import StepsLibraryManagement from "./components/StepsLibraryManagement";
import OrderTypePage from "./pages/OrderTypePage";
import OrderTypeStepsMappingPage from "./pages/OrderTypeStepsMappingPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Authprovider>
            <AppProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<AppLayout />} />
                <Route path="/dashboard/:view" element={<AppLayout />} />
                <Route path="/capabilities" element={<CapabilitiesPage />} />
                <Route path="/steps-library" element={<StepsLibraryManagement />} />
                <Route path="/order-types" element={<OrderTypePage />} />
                <Route path="/order-types/:order_type_id/steps-mapping" element={<OrderTypeStepsMappingPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppProvider>
          </Authprovider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
