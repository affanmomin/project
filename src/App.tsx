import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/dashboard";
import SelfAnalytics from "@/pages/my-analytics";
import Competitors from "@/pages/competitors";
import CompetitorDetails from "@/pages/competitors/[id]";
import Leads from "@/pages/leads";
import Features from "@/pages/features";
import Complaints from "@/pages/complaints";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import SignupPage from "@/pages/signup";
import LoginPage from "./pages/login";
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="rivaleye-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/my-analytics" element={<SelfAnalytics />} />
                    <Route path="/competitors" element={<Competitors />} />
                    <Route
                      path="/competitors/:id"
                      element={<CompetitorDetails />}
                    />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/complaints" element={<Complaints />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              }
            />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
