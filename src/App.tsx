import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/pages/Dashboard'
import { Practice } from '@/pages/Practice'
import { Library } from '@/pages/Library'
import { Program } from '@/pages/Program'
import { Community } from '@/pages/Community'

function App() {
  return (
    <Router basename="/nhapluu">
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/thien-dinh" element={<Practice />} />
            <Route path="/kinh-tang" element={<Library />} />
            <Route path="/chuong-trinh" element={<Program />} />
            <Route path="/cong-dong" element={<Community />} />
          </Routes>
        </main>
        <footer className="border-t border-border mt-16">
          <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
            <p className="mb-2">Xây dựng với chánh niệm • Built with Mindfulness</p>
            <p className="font-serif italic">
              Sabbe sattā sukhi hontu • Cầu cho tất cả chúng sinh được an lạc
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
