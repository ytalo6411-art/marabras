import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { ToastProvider } from '@/components/ui';
import AppShell from '@/components/AppShell';
import LoginPage from '@/pages/auth/LoginPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import { Spinner } from '@/components/Spinner';

// Rotas pesadas são carregadas sob demanda (code splitting).
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ExercisesPage = lazy(() => import('@/pages/ExercisesPage'));
const ExerciseDetailPage = lazy(() => import('@/pages/ExerciseDetailPage'));
const WorkoutsPage = lazy(() => import('@/pages/WorkoutsPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const CoachPage = lazy(() => import('@/pages/CoachPage'));
const WorkoutBuilderPage = lazy(() => import('@/pages/WorkoutBuilderPage'));
const WorkoutSessionPage = lazy(() => import('@/pages/WorkoutSessionPage'));
const NutritionPage = lazy(() => import('@/pages/NutritionPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/** Redireciona para o login preservando o destino pretendido. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, initializing, configured } = useAuthStore();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="offline-page">
        <Spinner size={28} />
      </div>
    );
  }

  if (!configured) return <Navigate to="/app/login" replace />;

  if (!user) {
    return <Navigate to="/app/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

/** Restringe uma rota a administradores. */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, initializing } = useAuthStore();

  if (initializing) {
    return (
      <div className="offline-page">
        <Spinner size={28} />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/app" replace />;

  return <>{children}</>;
}

function PageFallback() {
  return (
    <div className="offline-page">
      <Spinner size={28} />
    </div>
  );
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Público */}
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="/app/login" element={<LoginPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/app/support" element={<SupportPage />} />
            <Route path="/legal/:doc" element={<LegalPage />} />

            {/* Protegido */}
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="exercises" element={<ExercisesPage />} />
              <Route path="exercises/:slug" element={<ExerciseDetailPage />} />
              <Route path="workouts" element={<WorkoutsPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="coach" element={<CoachPage />} />
              <Route path="workouts/new" element={<WorkoutBuilderPage />} />
              <Route path="workouts/:id" element={<WorkoutBuilderPage />} />
              <Route path="session/:id" element={<WorkoutSessionPage />} />
              <Route path="nutrition" element={<NutritionPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route
                path="admin"
                element={
                  <RequireAdmin>
                    <AdminPage />
                  </RequireAdmin>
                }
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}
