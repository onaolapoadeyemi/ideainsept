import { Check, Zap } from "lucide-react";
import { sprintPassEntitlement } from "./entitlements";
import { analytics } from "../../shared/services/analytics";
import { useToast } from "../../shared/components/Toast";

export default function PricingPage() {
  const { notify } = useToast();
  async function startCheckout() {
    analytics.track("checkout_started", { plan: "sprint_pass" });
    const response = await fetch("/api/create-checkout-session", { method: "POST" });
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
        <p className="mt-3 text-muted">One no-signup idea, five saved seasonal generations after signup, one active sprint, and one public showcase submission.</p>
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
            `${sprintPassEntitlement.aiGenerationsPerSeason} AI generations per season`,
            "Idea refinement and pivot suggestions",
            "AI-generated 30-day execution plan",
            "Up to 3 active sprint experiments",
            "Private notes, exportable report, and unlisted sprint option",
            "Priority showcase review, described as faster review only",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="text-amber-300" size={18} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <button className="button button-primary mt-6" onClick={startCheckout}>
          <Zap size={18} aria-hidden="true" />
          Upgrade Now
        </button>
      </article>
    </section>
  );
}
