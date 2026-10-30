import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { Avatar, Button } from '@/components/ui';
import {
  IconHome,
  IconDumbbell,
  IconNutrition,
  IconChart,
  IconUser,
  IconSettings,
  IconBell,
  IconMoon,
  IconSun,
  IconLogout,
  IconShield,
} from './icons';

interface NavItem {
  to: string;
  label: string;
  icon: typeof IconHome;
  /** Aparece na navegação inferior do mobile. */
  primary?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Início', icon: IconHome, primary: true },
  { to: '/app/exercises', label: 'Exercícios', icon: IconDumbbell, primary: true },
  { to: '/app/workouts', label: 'Treinos', icon: IconChart, primary: true },
  { to: '/app/nutrition', label: 'Nutrição', icon: IconNutrition, primary: true },
  { to: '/app/progress', label: 'Evolução', icon: IconChart },
  { to: '/app/profile', label: 'Perfil', icon: IconUser },
  { to: '/app/settings', label: 'Configurações', icon: IconSettings },
];

/** Move o foco para o heading principal a cada troca de rota (acessibilidade). */
function useRouteFocus() {
  const location = useLocation();
  useEffect(() => {
    const main = document.querySelector<HTMLElement>('#main-content');
    if (!main) return;
    // Small delay lets the new page render before focusing.
    const id = window.setTimeout(() => {
      const heading = main.querySelector<HTMLElement>('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      } else {
        main.focus();
      }
    }, 60);
    return () => window.clearTimeout(id);
  }, [location.pathname]);
}

function useTheme() {
  const preferences = useAuthStore((s) => s.preferences);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('athletix-theme') as 'light' | 'dark') || 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('athletix-theme', theme);
  }, [theme]);

  // Mantém em sincronia com a preferência salva no perfil.
  useEffect(() => {
    if (preferences?.theme === 'light' || preferences?.theme === 'dark') {
      setTheme(preferences.theme);
    }
  }, [preferences?.theme]);

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}

export default function AppShell() {
  const { profile, isAdmin, signOut, unreadCount } = useAuthStore();
  const { theme, toggle } = useTheme();
  useRouteFocus();

  const primaryItems = NAV_ITEMS.filter((i) => i.primary);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>

      <header className="app-header">
        <div className="container app-header__inner">
          <NavLink to="/app" className="brand" aria-label="ATHLETIX — início">
            <span className="brand-mark">A</span>
            <span>
              ATHLETIX
              <span className="brand-sub">Train. Track. Evolve.</span>
            </span>
          </NavLink>

          <div className="header-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>

            <NavLink
              to="/app/notifications"
              className="btn btn-ghost btn-sm"
              aria-label={`Notificações${unreadCount ? ` (${unreadCount} não lidas)` : ''}`}
              style={{ position: 'relative' }}
            >
              <IconBell size={18} />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                  }}
                />
              )}
            </NavLink>

            <NavLink to="/app/profile" aria-label="Meu perfil">
              <Avatar name={profile?.full_name} src={profile?.avatar_url} />
            </NavLink>
          </div>
        </div>
      </header>

      <div className="container app-body" style={{ paddingBlock: 'var(--sp-5)' }}>
        {/* Navegação lateral — desktop */}
        <nav className="side-nav" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className="side-nav__item"
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/app/admin" className="side-nav__item">
              <IconShield size={19} />
              Painel admin
            </NavLink>
          )}

          <div className="divider" />

          <Button
            variant="ghost"
            className="side-nav__item"
            onClick={() => void signOut()}
            style={{ justifyContent: 'flex-start' }}
          >
            <IconLogout size={19} />
            Sair
          </Button>
        </nav>

        {/* Conteúdo */}
        <main id="main-content" tabIndex={-1} style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      {/* Navegação inferior — mobile */}
      <nav className="bottom-nav" aria-label="Navegação principal">
        {primaryItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className="bottom-nav__item"
          >
            <item.icon size={21} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
