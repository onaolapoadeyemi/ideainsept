import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { analytics } from "../../shared/services/analytics";
import { readJson, writeJson } from "../../shared/lib/storage";

export type DemoUser = {
  id: string;
  email: string;
  displayName: string;
  role: "user" | "moderator" | "admin";
};

type AuthContextValue = {
  user: DemoUser | null;
  signInWithDemo: (email?: string) => void;
  signOut: () => void;
};

const AUTH_KEY = "ideainsept.v1.demoUser";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<DemoUser | null>(() => readJson<DemoUser | null>(AUTH_KEY, null));
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signInWithDemo(email = "builder@example.com") {
        analytics.track("signup_started", { method: "demo" });
        const nextUser: DemoUser = {
          id: "demo-user",
          email,
          displayName: email.split("@")[0] || "Builder",
          role: email.includes("admin") ? "admin" : "user",
        };
        writeJson(AUTH_KEY, nextUser);
        setUser(nextUser);
        analytics.track("signup_completed", { method: "demo" });
      },
      signOut() {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
