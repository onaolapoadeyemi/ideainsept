import { useState } from "react";
import { GitBranch, LogOut, User } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { hasSupabaseClientConfig } from "../../app/config";

export default function AccountPage() {
  const { user, signInWithDemo, signOut } = useAuth();
  const [email, setEmail] = useState("builder@example.com");

  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel p-6">
        <h1 className="text-3xl font-black">Account</h1>
        <p className="mt-3 text-muted">
          GitHub OAuth is the production-ready path through Supabase Auth. Local demo sign-in is available so the product can be explored without paid services.
        </p>
        {user ? (
          <div className="mt-6">
            <p className="text-lg font-bold">{user.displayName}</p>
            <p className="text-muted">{user.email}</p>
            <button className="button button-secondary mt-5" onClick={signOut}>
              <LogOut size={18} aria-hidden="true" />
              Sign Out
            </button>
          </div>
        ) : (
          <form
            className="mt-6 grid max-w-md gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              signInWithDemo(email);
            }}
          >
            <label>
              <span className="label">Demo email</span>
              <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <button className="button button-primary" type="submit">
              <User size={18} aria-hidden="true" />
              Continue In Demo Mode
            </button>
            <button className="button button-ghost" type="button" disabled={!hasSupabaseClientConfig}>
              <GitBranch size={18} aria-hidden="true" />
              Continue With GitHub
            </button>
          </form>
        )}
      </div>
      <aside className="panel p-6">
        <h2 className="text-xl font-black">Production Auth Notes</h2>
        <ul className="mt-4 grid gap-3 text-sm text-muted">
          <li>Enable GitHub OAuth in Supabase Auth for the developer audience.</li>
          <li>Email magic links should stay disabled until a production-safe free email path is configured.</li>
          <li>Account deletion and export routes are implemented through the server-side account-data function.</li>
        </ul>
      </aside>
    </section>
  );
}
