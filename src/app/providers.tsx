import { PropsWithChildren } from "react";
import { AuthProvider } from "../modules/auth/AuthProvider";
import { ToastProvider } from "../shared/components/Toast";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
