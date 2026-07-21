import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AppProviders } from "@/core/providers/AppProviders";

const Landing = () => <div style={{ padding: '2rem' }}><h1>Landing Page</h1><a href="/dashboard">Ir al Dashboard</a></div>;
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: '2rem' }}>Cargando...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AppProviders>
);

export default App;
