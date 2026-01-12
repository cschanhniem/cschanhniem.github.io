import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Header } from '@/components/layout/Header'

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

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router basename="/nhapluu">
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
    </Router>
  )
}

export default App
