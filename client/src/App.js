import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';
import BottomTabBar from './components/common/BottomTabBar';
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';

import './styles/global.css';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ShopDetailPage = lazy(() => import('./pages/ShopDetailPage'));
const WriteReviewPage = lazy(() => import('./pages/WriteReviewPage'));
const ReportShopPage = lazy(() => import('./pages/ReportShopPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AddShopPage = lazy(() => import('./pages/AddShopPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PremiumPage = lazy(() => import('./pages/PremiumPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
    <div className="spinner" />
  </div>
);

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

const App = () => {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <ToastProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public — no shell */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/onboarding" element={
                      <ProtectedRoute><AppShell><OnboardingPage /></AppShell></ProtectedRoute>
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
                    <Route path="/profile/:id" element={
                      <ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute><AppShell><SettingsPage /></AppShell></ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>
                    } />
                    <Route path="/premium" element={
                      <ProtectedRoute><AppShell><PremiumPage /></AppShell></ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Router>
            </ToastProvider>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
