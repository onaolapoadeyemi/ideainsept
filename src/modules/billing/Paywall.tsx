import { Lock, Zap } from "lucide-react";
import { analytics } from "../../shared/services/analytics";
import { useEffect } from "react";
import { useEntitlement } from "./EntitlementProvider";

export function Paywall({ feature, benefit }: { feature: string; benefit: string }) {
  const { entitlement } = useEntitlement();
  useEffect(() => analytics.track("paywall_viewed", { feature }), [feature]);
  if (entitlement.plan === "sprint_pass") return null;
  return (
    <aside className="panel border-amber-400/35 p-5">
      <div className="flex items-start gap-3">
        <Lock className="mt-1 text-amber-300" size={20} aria-hidden="true" />
        <div>
          <h2 className="text-lg font-black">{feature}</h2>
          <p className="mt-1 text-sm text-muted">{benefit}</p>
          <a href="/pricing" className="button button-primary mt-4">
            <Zap size={17} aria-hidden="true" />
            See Sprint Pass
          </a>
        </div>
      </div>
    </aside>
  );
}
