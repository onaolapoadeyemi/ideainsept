import { PropsWithChildren } from "react";
import { AuthProvider } from "../modules/auth/AuthProvider";
import { ToastProvider } from "../shared/components/Toast";
import { SeasonProvider } from "../modules/season/SeasonProvider";
import { FeatureFlagProvider } from "./featureFlags";
import { EntitlementProvider } from "../modules/billing/EntitlementProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      <AuthProvider>
        <SeasonProvider>
          <EntitlementProvider>
            <FeatureFlagProvider>{children}</FeatureFlagProvider>
          </EntitlementProvider>
        </SeasonProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
