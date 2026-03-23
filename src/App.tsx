import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OversightDashboard from './views/OversightDashboard';
import CitizenDashboard from './views/CitizenDashboard';
import SubmitIssue from './views/SubmitIssue';
import CityMap from './views/CityMap';
import Transparency from './views/Transparency';
import Settings from './views/Settings';
import { AppProvider } from './AppContext';
import Login from "./views/Login";
import Adminpanel from "./views/Adminpanel";

// ── Blocks access to /admin if not logged in — redirects to /login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/"            element={<CitizenDashboard />} />
          <Route path="/submit"      element={<SubmitIssue />} />
          <Route path="/city-map"    element={<CityMap />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/settings"    element={<Settings />} />
          <Route path="/login"       element={<Login />} />

          {/* ── Protected: only accessible after admin login */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Adminpanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}