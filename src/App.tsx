
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FontProvider } from "./context/FontContext";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import FontArchive from "./pages/FontArchive";
import FontDetails from "./pages/FontDetails";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

// For smoother animations
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FontProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/fonts" element={<FontArchive />} />
                <Route path="/fonts/:id" element={<FontDetails />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </FontProvider>
  </QueryClientProvider>
);

export default App;
