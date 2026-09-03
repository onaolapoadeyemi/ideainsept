import { GitBranch, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { hasSupabaseClientConfig } from "../../app/config";
import { useToast } from "../../shared/components/Toast";
import { apiFetch } from "../../shared/services/api";

export default function AccountPage() {
  const { user, loading, signInWithGitHub, signOut } = useAuth();
  const { notify } = useToast();

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
          Sign in with GitHub to save your ideas, sprint progress, showcase submissions, and votes securely.
        </p>
        {loading ? <p className="mt-6 text-muted">Checking your secure session…</p> : user ? (
          <div className="mt-6">
            <p className="text-lg font-bold">{user.displayName}</p>
            <p className="text-muted">{user.email}</p>
            <button className="button button-secondary mt-5" onClick={() => void signOut()}>
              <LogOut size={18} aria-hidden="true" />
              Sign Out
            </button>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="button button-ghost" onClick={() => void accountAction("export")}>Export My Data</button>
              <button className="button button-ghost" onClick={() => void accountAction("delete")}>Request Account Deletion</button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid max-w-md gap-4">
            {!hasSupabaseClientConfig ? <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-muted">Secure sign-in is being configured. Please check back shortly.</p> : null}
            <button
              className="button button-primary"
              type="button"
              disabled={!hasSupabaseClientConfig}
              onClick={() => void signInWithGitHub().catch((error) => notify(error instanceof Error ? error.message : "GitHub sign-in failed.", "error"))}
            >
              <GitBranch size={18} aria-hidden="true" />
              Continue Securely With GitHub
            </button>
          </div>
        )}
      </div>
      <aside className="panel p-6">
        <h2 className="text-xl font-black">Your account</h2>
        <ul className="mt-4 grid gap-3 text-sm text-muted">
          <li>GitHub is the only sign-in method currently enabled.</li>
          <li>Your project data is protected by Supabase row-level security.</li>
          <li>You can export or request deletion of your account data at any time.</li>
        </ul>
      </aside>
    </section>
  );
}
