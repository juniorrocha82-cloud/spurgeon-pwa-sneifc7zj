import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import SermonPage from './pages/Sermon'
import HistoryPage from './pages/History'
import DevotionalsPage from './pages/Devotionals'
import DevotionalViewPage from './pages/DevotionalView'
import BiblePage from './pages/Bible'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import AuthPage from './pages/Auth'
import ForgotPasswordPage from './pages/ForgotPassword'
import ResetPasswordPage from './pages/ResetPassword'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import AboutPage from './pages/About'
import ContactPage from './pages/Contact'
import PlansPage from './pages/Plans'
import SuccessPage from './pages/Success'
import AdminPage from './pages/Admin'
import { SermonProvider } from './store/SermonContext'
import { AuthProvider, useAuth } from './hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <SermonProvider>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Index />} />
          <Route path="/sermon/:id" element={<SermonPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/devotionals" element={<DevotionalsPage />} />
          <Route path="/devotional/:id" element={<DevotionalViewPage />} />
          <Route path="/bible" element={<BiblePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/planos" element={<PlansPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SermonProvider>
  )
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
