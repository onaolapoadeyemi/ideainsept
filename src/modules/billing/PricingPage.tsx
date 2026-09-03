import { Check, Zap } from "lucide-react";
import { analytics } from "../../shared/services/analytics";
import { useToast } from "../../shared/components/Toast";
import { apiFetch } from "../../shared/services/api";
import { clientConfig } from "../../app/config";
import { useAuth } from "../auth/AuthProvider";
import { useEntitlement } from "./EntitlementProvider";

export default function PricingPage() {
  const { notify } = useToast();
  const { user } = useAuth();
  const { entitlement } = useEntitlement();
  async function startCheckout() {
    analytics.track("checkout_started", { plan: "sprint_pass" });
    if (!clientConfig.paymentsEnabled) {
      notify("Payments are intentionally disabled until Stripe is connected in the next phase.", "info");
      return;
    }
    if (!user) {
      notify("Sign in before purchasing so the pass can be linked to your account.", "warning");
      return;
    }
    const response = await apiFetch("/api/create-checkout-session", { method: "POST" });
    if (!response.ok) {
      notify("Stripe is not configured yet. Add test credentials to enable checkout.", "warning");
      return;
    }
    const data = (await response.json()) as { url: string };
    window.location.assign(data.url);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="panel p-6">
        <h1 className="text-3xl font-black">Free Explorer</h1>
        <p className="mt-3 text-muted">One no-signup idea, a tightly limited live-AI allowance with unlimited curated fallbacks, one active sprint, and one public showcase submission.</p>
        <ul className="mt-6 grid gap-3 text-sm">
          {["AI idea generator", "30-day sprint tracker", "Community voting", "One public showcase submission"].map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="text-emerald-300" size={18} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </article>
      <article className="panel border-amber-400/60 p-6">
        <h1 className="text-3xl font-black">$29 Sprint Pass</h1>
        <p className="mt-3 text-muted">A one-time annual season pass. No automatic renewal is enabled in this MVP.</p>
        <ul className="mt-6 grid gap-3 text-sm">
          {[
            "Expanded AI allowance within the platform-wide cost ceiling",
            "Idea refinement and pivot suggestions",
            "AI-generated 30-day execution plan",
            "Private notes, exportable report, and unlisted sprint option",
            "Priority showcase review, described as faster review only",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="text-amber-300" size={18} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <button className="button button-primary mt-6" onClick={startCheckout} disabled={!clientConfig.paymentsEnabled || entitlement.plan === "sprint_pass"}>
          <Zap size={18} aria-hidden="true" />
          {entitlement.plan === "sprint_pass" ? "Sprint Pass Active" : clientConfig.paymentsEnabled ? "Upgrade Now" : "Payments Coming Next"}
        </button>
      </article>
    </section>
  );
}
