import { useState } from "react";
import { GitBranch, LogOut, User } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { hasSupabaseClientConfig } from "../../app/config";
import { useToast } from "../../shared/components/Toast";
import { apiFetch } from "../../shared/services/api";

export default function AccountPage() {
  const { user, loading, signInWithDemo, signInWithGitHub, signOut } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState("builder@example.com");

  async function accountAction(action: "export" | "delete") {
    try {
      const response = await apiFetch("/api/account-data", { method: "POST", body: JSON.stringify({ action }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Account request failed.");
      if (action === "delete") {
        notify("Deletion request recorded. Support will verify and complete the request.", "info");
        return;
      }
      const blob = new Blob([JSON.stringify(body.export, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ideainsept-account-export.json";
      link.click();
      URL.revokeObjectURL(url);
      notify("Account data exported.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Account request failed.", "error");
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel p-6">
        <h1 className="text-3xl font-black">Account</h1>
        <p className="mt-3 text-muted">
          GitHub OAuth is the production-ready path through Supabase Auth. Local demo sign-in is available so the product can be explored without paid services.
        </p>
        {loading ? <p className="mt-6 text-muted">Checking your secure session…</p> : user ? (
          <div className="mt-6">
            <p className="text-lg font-bold">{user.displayName}</p>
            <p className="text-muted">{user.email}</p>
            <button className="button button-secondary mt-5" onClick={() => void signOut()}>
              <LogOut size={18} aria-hidden="true" />
              Sign Out
            </button>
            {hasSupabaseClientConfig ? <div className="mt-4 flex flex-wrap gap-3">
              <button className="button button-ghost" onClick={() => void accountAction("export")}>Export My Data</button>
              <button className="button button-ghost" onClick={() => void accountAction("delete")}>Request Account Deletion</button>
            </div> : null}
          </div>
        ) : (
          <form
            className="mt-6 grid max-w-md gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              signInWithDemo(email);
            }}
          >
            {!hasSupabaseClientConfig ? <label>
              <span className="label">Demo email</span>
              <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label> : null}
            {!hasSupabaseClientConfig ? <button className="button button-primary" type="submit">
              <User size={18} aria-hidden="true" />
              Continue In Demo Mode
            </button> : null}
            <button
              className="button button-primary"
              type="button"
              disabled={!hasSupabaseClientConfig}
              onClick={() => void signInWithGitHub().catch((error) => notify(error instanceof Error ? error.message : "GitHub sign-in failed.", "error"))}
            >
              <GitBranch size={18} aria-hidden="true" />
              Continue Securely With GitHub
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
