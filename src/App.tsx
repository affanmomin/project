import { ThemeProvider } from '@/components/providers/theme-provider';
import AppLayout from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/dashboard';
import Competitors from '@/pages/competitors';
import CompetitorDetails from '@/pages/competitors/[id]';
import Leads from '@/pages/leads';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="insightminer-theme">
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/competitors/:id" element={<CompetitorDetails />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;