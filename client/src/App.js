import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';
import BottomTabBar from './components/common/BottomTabBar';

import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ShopDetailPage from './pages/ShopDetailPage';
import WriteReviewPage from './pages/WriteReviewPage';
import ReportShopPage from './pages/ReportShopPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import AddShopPage from './pages/AddShopPage';
import SettingsPage from './pages/SettingsPage';

import './styles/global.css';

/* Shell wraps all authenticated pages with Navbar + BottomTabBar */
const AppShell = ({ children }) => (
  <div className="app-shell">
    <Navbar />
    <main className="page-wrapper">
      {children}
    </main>
    <BottomTabBar />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* Public — no shell */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute><OnboardingPage /></ProtectedRoute>
                } />

                {/* Protected — wrapped in AppShell */}
                <Route path="/home" element={
                  <ProtectedRoute><AppShell><HomePage /></AppShell></ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute><AppShell><SearchPage /></AppShell></ProtectedRoute>
                } />
                <Route path="/shop/:id" element={
                  <ProtectedRoute><AppShell><ShopDetailPage /></AppShell></ProtectedRoute>
                } />
                <Route path="/write-review" element={
                  <ProtectedRoute><AppShell><WriteReviewPage /></AppShell></ProtectedRoute>
                } />
                <Route path="/write-review/:shopId" element={
                  <ProtectedRoute><AppShell><WriteReviewPage /></AppShell></ProtectedRoute>
                } />
                <Route path="/add-shop" element={
                  <ProtectedRoute><AppShell><AddShopPage /></AppShell></ProtectedRoute>
                } />
                <Route path="/report/:shopId" element={
                  <ProtectedRoute><AppShell><ReportShopPage /></AppShell></ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute><AppShell><NotificationsPage /></AppShell></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute><AppShell><SettingsPage /></AppShell></ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
