import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { analytics } from "../../shared/services/analytics";
import { readJson, writeJson } from "../../shared/lib/storage";
import { hasSupabaseClientConfig } from "../../app/config";
import { supabase } from "../../shared/services/supabase";

export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  role: "user" | "moderator" | "admin";
};

type AuthContextValue = {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signInWithGitHub: () => Promise<void>;
  signInWithDemo: (email?: string) => void;
  signOut: () => Promise<void>;
};

const AUTH_KEY = "ideainsept.v2.demoUser";
const AuthContext = createContext<AuthContextValue | null>(null);

function displayNameFor(user: User) {
  return String(user.user_metadata?.full_name || user.user_metadata?.user_name || user.email?.split("@")[0] || "Builder");
}

async function toAppUser(user: User): Promise<AppUser> {
  let role: AppUser["role"] = "user";
  let displayName = displayNameFor(user);
  if (supabase) {
    const { data } = await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle();
    if (data?.display_name) displayName = data.display_name;
    if (data?.role === "admin" || data?.role === "moderator") role = data.role;
  }
  return { id: user.id, email: user.email || "", displayName, role };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(() =>
    hasSupabaseClientConfig ? null : readJson<AppUser | null>(AUTH_KEY, null),
  );
  const [loading, setLoading] = useState(hasSupabaseClientConfig);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ? await toAppUser(data.session.user) : null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      window.setTimeout(async () => {
        if (!active) return;
        setUser(nextSession?.user ? await toAppUser(nextSession.user) : null);
        setLoading(false);
      }, 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isDemo: !hasSupabaseClientConfig,
      async signInWithGitHub() {
        if (!supabase) throw new Error("GitHub sign-in is unavailable in local demo mode.");
        analytics.track("signup_started", { method: "github" });
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo: `${window.location.origin}/account` },
        });
        if (error) throw error;
      },
      signInWithDemo(email = "builder@example.com") {
        if (hasSupabaseClientConfig) throw new Error("Demo sign-in is disabled in configured deployments.");
        const nextUser: AppUser = {
          id: "00000000-0000-4000-8000-000000000001",
          email,
          displayName: email.split("@")[0] || "Builder",
          role: email.includes("admin") ? "admin" : "user",
        };
        writeJson(AUTH_KEY, nextUser);
        setUser(nextUser);
        analytics.track("signup_completed", { method: "demo" });
      },
      async signOut() {
        if (supabase) await supabase.auth.signOut();
        localStorage.removeItem(AUTH_KEY);
        setSession(null);
        setUser(null);
      },
    }),
    [loading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
