import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/ui/toast'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Header } from '@/components/layout/Header'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Practice = lazy(() => import('@/pages/Practice').then(m => ({ default: m.Practice })))
const Library = lazy(() => import('@/pages/Library').then(m => ({ default: m.Library })))
const SuttaDetail = lazy(() => import('@/pages/SuttaDetail').then(m => ({ default: m.SuttaDetail })))
const Program = lazy(() => import('@/pages/Program').then(m => ({ default: m.Program })))
const Community = lazy(() => import('@/pages/Community').then(m => ({ default: m.Community })))
const FindSangha = lazy(() => import('@/pages/FindSangha').then(m => ({ default: m.FindSangha })))
const CodeOfConduct = lazy(() => import('@/pages/CodeOfConduct').then(m => ({ default: m.CodeOfConduct })))
const Onboarding = lazy(() => import('@/pages/Onboarding').then(m => ({ default: m.Onboarding })))
const WakefulRelaxation = lazy(() => import('@/pages/WakefulRelaxation').then(m => ({ default: m.WakefulRelaxation })))
const Auth = lazy(() => import('@/pages/Auth'))

// Loading fallback component with skeleton
function PageLoader() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Content skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center pt-4">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
        <span className="ml-3 text-sm text-muted-foreground">Đang tải...</span>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router basename="/nhapluu">
      <ThemeProvider>
      <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route
                path="/*"
                element={
                  <>
                    <Header />
                    <main>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/tim-sangha" element={<FindSangha />} />
                        <Route path="/quy-tac" element={<CodeOfConduct />} />
                        <Route path="/cong-dong" element={<Community />} />

                        {/* Protected Routes */}
                        <Route
                          path="/"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/thien-dinh"
                          element={
                            <ProtectedRoute>
                              <Practice />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/thien-dinh/thu-gian"
                          element={
                            <ProtectedRoute>
                              <WakefulRelaxation />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/kinh-tang"
                          element={
                            <ProtectedRoute>
                              <Library />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/kinh-tang/:suttaId"
                          element={
                            <ProtectedRoute>
                              <SuttaDetail />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/chuong-trinh"
                          element={
                            <ProtectedRoute>
                              <Program />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </main>
                    <footer className="border-t border-border mt-16">
                      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                        <p className="mb-2 font-medium text-foreground">Công nghệ vị nhân sinh - Tỉnh thức giữa đời thường</p>
                        <p className="text-xs">
                          Cộng đồng Nhập Lưu • Stream Entry Community
                        </p>
                        <p className="text-[10px] mt-3 opacity-50" title={`Build: ${__BUILD_TIME__}`}>
                          v{__GIT_HASH__} • {new Date(__BUILD_TIME__).toLocaleDateString('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </footer>
                  </>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
      </ToastProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
