import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/pages/Dashboard'
import { Practice } from '@/pages/Practice'
import { Library } from '@/pages/Library'
import { SuttaDetail } from '@/pages/SuttaDetail'
import { Program } from '@/pages/Program'
import { Community } from '@/pages/Community'
import { FindSangha } from '@/pages/FindSangha'
import { CodeOfConduct } from '@/pages/CodeOfConduct'
import { Onboarding } from '@/pages/Onboarding'
import { WakefulRelaxation } from '@/pages/WakefulRelaxation'
import Auth from '@/pages/Auth'

function App() {
  return (
    <Router basename="/nhapluu">
      <AuthProvider>
        <div className="min-h-screen bg-background">
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
                    </div>
                  </footer>
                </>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App

