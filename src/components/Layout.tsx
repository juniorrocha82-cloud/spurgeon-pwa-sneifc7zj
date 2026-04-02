import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { Feather, History, Settings, BookOpen, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Gerar Sermão', icon: Feather },
    { path: '/history', label: 'Meus Sermões', icon: History },
  ]

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Preparo de Sermão'
    if (location.pathname.startsWith('/sermon/')) return 'Resultado da Pregação'
    if (location.pathname === '/history') return 'Meus Sermões'
    if (location.pathname === '/settings') return 'Configurações'
    if (location.pathname === '/about') return 'Sobre'
    return 'Spurgeon PWA'
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-card border-r border-border z-50 shadow-elevation">
        <div className="h-20 flex items-center px-6 border-b border-border/50">
          <BookOpen className="w-7 h-7 text-primary mr-3" />
          <span className="font-serif text-2xl font-bold text-primary tracking-wide">Spurgeon</span>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-3">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium shadow-subtle'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 mr-3 transition-colors',
                    isActive ? 'text-primary' : 'group-hover:text-primary',
                  )}
                />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border/50">
          <Link
            to="/settings"
            className={cn(
              'flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group',
              location.pathname === '/settings'
                ? 'bg-primary/10 text-primary font-medium shadow-subtle'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <Settings
              className={cn(
                'w-5 h-5 mr-3 transition-colors',
                location.pathname === '/settings' ? 'text-primary' : 'group-hover:text-primary',
              )}
            />
            Configurações
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen relative flex flex-col">
        {/* Header */}
        <header className="h-16 md:h-20 sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 md:px-8 z-40">
          <div className="md:hidden flex items-center">
            <BookOpen className="w-6 h-6 text-primary mr-2" />
            <span className="font-serif text-xl font-bold text-primary">Spurgeon</span>
          </div>
          <div className="hidden md:block font-serif text-2xl text-foreground/90 font-medium">
            {getPageTitle()}
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold border border-primary/20 text-primary shadow-subtle cursor-pointer hover:bg-primary/10 transition-colors">
            PR
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col">
          <Outlet />
        </div>

        {/* Floating About Link */}
        <Link
          to="/about"
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-card border border-border shadow-elevation p-3 rounded-full text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 z-50 flex items-center justify-center group hover:pr-5"
          title="Sobre o Spurgeon"
        >
          <Info className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] transition-all duration-300 ease-in-out text-sm font-medium opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-2">
            Sobre
          </span>
        </Link>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur border-t border-border flex items-center justify-around z-50 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-wide">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
