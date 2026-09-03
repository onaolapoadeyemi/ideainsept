import { NavLink, Outlet } from "react-router-dom";
import { Lightbulb, Route, Trophy, CreditCard, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../modules/auth/AuthProvider";
import { FeatureFlagKey, useFeatureFlags } from "./featureFlags";

const links = [
  { to: "/", label: "Home", icon: Lightbulb },
  { to: "/generator", label: "Generator", icon: Lightbulb, flag: "aiGenerator" as FeatureFlagKey },
  { to: "/sprint", label: "My Sprint", icon: Route, flag: "sprintTracker" as FeatureFlagKey },
  { to: "/showcase", label: "Showcase", icon: Trophy, flag: "showcase" as FeatureFlagKey },
  { to: "/pricing", label: "Pricing", icon: CreditCard, flag: "billing" as FeatureFlagKey },
];

export function App() {
  const { user } = useAuth();
  const { flags } = useFeatureFlags();
  const visibleLinks = links.filter((link) => !link.flag || flags[link.flag]);

  return (
      <div className="min-h-screen bg-app text-app">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0e12]/95 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <NavLink to="/" className="flex items-center gap-2 text-xl font-black tracking-normal">
              <span>IdeaIn</span>
              <span className="text-amber-400">Sept</span>
            </NavLink>
            <div className="hidden items-center gap-1 md:flex">
              {visibleLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
              {user && ["admin", "moderator"].includes(user.role) ? <NavLink to="/admin" className="nav-link">
                <ShieldCheck size={17} aria-hidden="true" />
                Admin
              </NavLink> : null}
            </div>
            <NavLink to="/account" className="button button-ghost">
              <User size={18} aria-hidden="true" />
              {user ? user.displayName : "Account"}
            </NavLink>
          </nav>
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 md:hidden">
            {visibleLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link shrink-0 ${isActive ? "nav-link-active" : ""}`}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </div>
        </header>
        <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
        <footer className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-10 text-sm text-muted sm:px-6">
          <NavLink to="/privacy">Privacy</NavLink>
          <NavLink to="/terms">Terms</NavLink>
          <NavLink to="/guidelines">Community Guidelines</NavLink>
          <NavLink to="/rules">Contest Rules</NavLink>
          <NavLink to="/affiliate-disclosure">Affiliate Disclosure</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </footer>
      </div>
  );
}
