import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, Zap } from "lucide-react";
import { analytics } from "../../shared/services/analytics";
import { useToast } from "../../shared/components/Toast";
import { apiFetch } from "../../shared/services/api";
import { clientConfig } from "../../app/config";
import { useAuth } from "../auth/AuthProvider";
import { useEntitlement } from "./EntitlementProvider";

export default function PricingPage() {
  const { notify } = useToast();
  const { user } = useAuth();
  const { entitlement, refresh } = useEntitlement();
  const checkoutStatus = new URLSearchParams(window.location.search).get("checkout");
  const [syncingPurchase, setSyncingPurchase] = useState(checkoutStatus === "success" && entitlement.plan !== "sprint_pass");
  const notified = useRef(false);

  useEffect(() => {
    if (checkoutStatus !== "success" || !user) return;

    if (entitlement.plan === "sprint_pass") {
      setSyncingPurchase(false);
      if (!notified.current) {
        notified.current = true;
        analytics.track("checkout_completed", { plan: "sprint_pass" });
        notify("Payment confirmed. Your Sprint Pass is active.", "success");
        window.history.replaceState({}, "", window.location.pathname);
      }
      return;
    }

    let cancelled = false;
    let attempts = 0;
    setSyncingPurchase(true);
    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      await refresh();
      if (!cancelled && attempts < 12) window.setTimeout(poll, 1250);
      if (!cancelled && attempts >= 12) {
        setSyncingPurchase(false);
        notify("Your payment was received, but access is still syncing. Refresh this page in a moment.", "info");
      }
    };
    void poll();
    return () => { cancelled = true; };
  }, [checkoutStatus, entitlement.plan, notify, refresh, user]);
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
    try {
      const response = await apiFetch("/api/create-checkout-session", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: { message?: string } };
      if (!response.ok || !data.url) throw new Error(data.error?.message || "Checkout could not be started.");
      window.location.assign(data.url);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Checkout could not be started.", "warning");
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="panel p-6">
        <h1 className="text-3xl font-black">Free Explorer</h1>
        <p className="mt-3 text-muted">One no-signup idea, a tightly limited live-AI allowance, curated idea options, one active sprint, and one public showcase submission.</p>
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
            "Up to 50 live-AI generations when the free quota is available, with curated ideas always available",
            "Guided idea refinement and pivot suggestions",
            "A structured 30-day execution plan",
            "Private sprint notes, exportable report, and unlisted sprint option",
            "Priority showcase review (faster moderation only; never votes or ranking)",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="text-amber-300" size={18} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        {syncingPurchase && (
          <p className="mt-6 text-sm text-amber-200" role="status">
            Confirming your payment and opening Sprint Pass access…
          </p>
        )}
        <button className="button button-primary mt-6" onClick={startCheckout} disabled={!clientConfig.paymentsEnabled || entitlement.plan === "sprint_pass" || syncingPurchase}>
          {syncingPurchase ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Zap size={18} aria-hidden="true" />}
          {entitlement.plan === "sprint_pass" ? "Sprint Pass Active" : syncingPurchase ? "Activating Pass…" : clientConfig.paymentsEnabled ? "Upgrade Now" : "Payments Coming Next"}
        </button>
      </article>
    </section>
  );
}
