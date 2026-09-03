import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { analytics } from "../../shared/services/analytics";
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
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
};

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
  const [user, setUser] = useState<AppUser | null>(null);
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
      async signInWithGitHub() {
        if (!supabase) throw new Error("Secure sign-in is not configured yet.");
        analytics.track("signup_started", { method: "github" });
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo: `${window.location.origin}/account` },
        });
        if (error) throw error;
      },
      async signOut() {
        if (supabase) await supabase.auth.signOut();
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
