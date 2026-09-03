import { lazy, ReactElement, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AppErrorBoundary, RouteErrorBoundary } from "../shared/components/ErrorBoundary";
import { LoadingPanel } from "../shared/components/LoadingPanel";
import { FeatureFlagKey, useFeatureFlags } from "./featureFlags";

const HomePage = lazy(() => import("../modules/idea-generator/HomePage"));
const IdeaGeneratorPage = lazy(() => import("../modules/idea-generator/IdeaGeneratorPage"));
const SprintTrackerPage = lazy(() => import("../modules/sprint-tracker/SprintTrackerPage"));
const ShowcasePage = lazy(() => import("../modules/showcase/ShowcasePage"));
const PricingPage = lazy(() => import("../modules/billing/PricingPage"));
const AdminPage = lazy(() => import("../modules/admin/AdminPage"));
const AccountPage = lazy(() => import("../modules/auth/AccountPage"));
const ContentPage = lazy(() => import("../shared/components/ContentPage"));

function lazyRoute(element: ReactElement) {
  return <Suspense fallback={<LoadingPanel label="Loading this part of IdeaInSept" />}>{element}</Suspense>;
}

function FeatureRoute({ flag, name, children }: { flag?: FeatureFlagKey; name: string; children: ReactElement }) {
  const { flags, loading } = useFeatureFlags();
  if (loading) return <LoadingPanel label={`Loading ${name}`} />;
  if (flag && !flags[flag]) {
    return (
      <section className="panel p-6">
        <h1 className="text-2xl font-black">{name} is temporarily unavailable</h1>
        <p className="mt-3 text-muted">Your other IdeaInSept tools remain available while this feature is paused.</p>
      </section>
    );
  }
  return <AppErrorBoundary name={name} resetKey={name}>{children}</AppErrorBoundary>;
}

function featureRoute(name: string, element: ReactElement, flag?: FeatureFlagKey) {
  return lazyRoute(<FeatureRoute name={name} flag={flag}>{element}</FeatureRoute>);
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: featureRoute("Home", <HomePage />) },
      { path: "generator", element: featureRoute("Idea Generator", <IdeaGeneratorPage />, "aiGenerator") },
      { path: "sprint", element: featureRoute("Sprint Tracker", <SprintTrackerPage />, "sprintTracker") },
      { path: "showcase", element: featureRoute("Showcase", <ShowcasePage />, "showcase") },
      { path: "pricing", element: featureRoute("Pricing", <PricingPage />, "billing") },
      { path: "admin", element: featureRoute("Administration", <AdminPage />) },
      { path: "account", element: featureRoute("Account", <AccountPage />) },
      { path: "privacy", element: lazyRoute(<ContentPage page="privacy" />) },
      { path: "terms", element: lazyRoute(<ContentPage page="terms" />) },
      { path: "guidelines", element: lazyRoute(<ContentPage page="guidelines" />) },
      { path: "rules", element: lazyRoute(<ContentPage page="rules" />) },
      { path: "affiliate-disclosure", element: lazyRoute(<ContentPage page="affiliate" />) },
      { path: "contact", element: lazyRoute(<ContentPage page="contact" />) },
    ],
  },
]);
