import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Timer, Users, LogOut, Cloud, MapPin, Shield, LogIn, Trophy, Sun, Moon, Languages, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useAppState } from '@/hooks/useAppState'
import { Button } from '@/components/ui/button'

export function Header() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { user, logout, isAuthenticated } = useAuth()
  const { isDark, setTheme } = useTheme()
  const { isSyncing } = useAppState()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(newLang)
  }

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.program'), href: '/chuong-trinh', icon: Trophy },
    { name: t('nav.practice'), href: '/thien-dinh', icon: Timer },
    { name: 'Pháp Bảo', href: '/phap-bao', icon: BookOpen },
    { name: t('nav.findSangha'), href: '/tim-sangha', icon: MapPin },
    { name: t('nav.community'), href: '/cong-dong', icon: Users },
    { name: t('nav.rules'), href: '/quy-tac', icon: Shield },
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

            {/* Theme Toggle & User Menu */}
            <div className="flex items-center space-x-2 border-l border-border pl-4">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleLanguage}
                className="text-muted-foreground hover:text-foreground"
                aria-label={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                title={i18n.language === 'vi' ? 'EN' : 'VI'}
              >
                <Languages className="h-4 w-4" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground"
                aria-label={isDark ? t('theme.light') : t('theme.dark')}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {isAuthenticated ? (
                <>
                  {/* Sync Indicator */}
                  <div className="relative" title={isSyncing ? t('sync.syncing') : t('sync.synced')}>
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
                    <span className="hidden sm:inline ml-2">{t('auth.logout')}</span>
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-foreground">
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('auth.login')}
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
