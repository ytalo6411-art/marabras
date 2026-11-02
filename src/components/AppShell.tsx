import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from './themeContext';
import { Avatar, Button, Modal } from '@/components/ui';
import { BrandMark } from '@/components/BrandMark';
import {
  IconHome,
  IconDumbbell,
  IconNutrition,
  IconChart,
  IconUser,
  IconSettings,
  IconMoon,
  IconSun,
  IconLogout,
  IconShield,
  IconSparkles,
  IconUsers,
  IconMenu,
} from './icons';

interface NavItem {
  to: string;
  label: string;
  icon: typeof IconHome;
  /** Aparece na navegação inferior do mobile. */
  primary?: boolean;
}

// Os 5 destinos principais ficam na barra inferior do mobile; o restante vive
// no menu "Explorar", acessível pelo cabeçalho.
const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Início', icon: IconHome, primary: true },
  { to: '/app/workouts', label: 'Treinos', icon: IconChart, primary: true },
  { to: '/app/exercises', label: 'Exercícios', icon: IconDumbbell, primary: true },
  { to: '/app/nutrition', label: 'Nutrição', icon: IconNutrition, primary: true },
  { to: '/app/profile', label: 'Perfil', icon: IconUser, primary: true },
  { to: '/app/community', label: 'Comunidade', icon: IconUsers },
  { to: '/app/coach', label: 'Treinador', icon: IconSparkles },
  { to: '/app/progress', label: 'Evolução', icon: IconChart },
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

export default function AppShell() {
  const { profile, isAdmin, signOut, profileError, refreshProfile } = useAuthStore();
  const { resolved: theme, toggle } = useTheme();
  useRouteFocus();

  const [menuOpen,setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false),[location.pathname]);
  const primaryItems = NAV_ITEMS.filter((i) => i.primary);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>

      {menuOpen && <button className="btn btn-ghost btn-sm" style={{position:'fixed',top:10,right:64,zIndex:101}} onClick={toggle} aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>{theme === 'dark' ? <IconSun size={18}/> : <IconMoon size={18}/>}</button>}
      <header className="app-header">
        <div className="container app-header__inner">
          <NavLink to="/app" className="brand" aria-label="ATHLETIX — início">
            <span className="brand-mark"><BrandMark size={20} /></span>
            <span>
              ATHLETIX
              <span className="brand-sub">Train. Track. Evolve.</span>
            </span>
          </NavLink>

          <div className="header-actions">
            <LanguageSelector />
            <button className="btn btn-ghost mobile-menu-button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><IconMenu size={20} /></button>

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
          {profileError && <div className="alert alert-warning" role="alert"><span>{profileError}</span><button className="btn btn-secondary" onClick={() => void refreshProfile()}>Tentar novamente</button></div>}
          <Outlet />
        </main>
      </div>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Explorar ATHLETIX"><nav className="mobile-menu" aria-label="Todas as seções">{NAV_ITEMS.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/app'} onClick={() => setMenuOpen(false)}><item.icon size={20}/>{item.label}</NavLink>)}{isAdmin && <NavLink to="/app/admin">Painel admin</NavLink>}<NavLink to="/app/support">Ajuda e suporte</NavLink></nav></Modal>
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
