
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { FontProvider } from "./context/FontContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import FontArchive from "./pages/FontArchive";
import FontDetails from "./pages/FontDetails";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import AddProject from "./pages/AddProject";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";

// For smoother animations
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <FontProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AnimatePresence mode="wait">
              <Routes>
                {/* Auth routes */}
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }>
                    <Route path="/" element={<Index />} />
                    <Route path="/fonts" element={<FontArchive />} />
                    <Route path="/fonts/:id" element={<FontDetails />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/add" element={<AddProject />} />
                    <Route path="/projects/:id" element={<ProjectDetails />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
            </AnimatePresence>
          </TooltipProvider>
        </FontProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
