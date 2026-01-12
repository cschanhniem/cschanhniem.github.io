import { Link, useLocation } from 'react-router-dom'
import { Home, Timer, Users, LogOut, Cloud, MapPin, Shield, LogIn, Trophy } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAppState } from '@/hooks/useAppState'
import { Button } from '@/components/ui/button'

export function Header() {
  const location = useLocation()
  const { user, logout, isAuthenticated } = useAuth()
  const { isSyncing } = useAppState()

  const navigation = [
    { name: 'Trang Chủ', href: '/', icon: Home },
    { name: 'Chương Trình', href: '/chuong-trinh', icon: Trophy },
    { name: 'Thiền Định', href: '/thien-dinh', icon: Timer },
    { name: 'Tìm Sangha', href: '/tim-sangha', icon: MapPin },
    { name: 'Cộng Đồng', href: '/cong-dong', icon: Users },
    { name: 'Quy Tắc', href: '/quy-tac', icon: Shield },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">入</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">NhapLuu</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2 border-l border-border pl-4">
              {isAuthenticated ? (
                <>
                  {/* Sync Indicator */}
                  <div className="relative" title={isSyncing ? "Đang đồng bộ..." : "Đã đồng bộ"}>
                    {isSyncing ? (
                      <Cloud className="h-4 w-4 text-primary animate-pulse" />
                    ) : (
                      <Cloud className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="hidden sm:block text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Đăng xuất</span>
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-foreground">
                    <LogIn className="h-4 w-4 mr-2" />
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
