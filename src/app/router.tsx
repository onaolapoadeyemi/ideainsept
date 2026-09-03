import { lazy, ReactElement, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { RouteErrorBoundary } from "../shared/components/ErrorBoundary";
import { LoadingPanel } from "../shared/components/LoadingPanel";

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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: lazyRoute(<HomePage />) },
      { path: "generator", element: lazyRoute(<IdeaGeneratorPage />) },
      { path: "sprint", element: lazyRoute(<SprintTrackerPage />) },
      { path: "showcase", element: lazyRoute(<ShowcasePage />) },
      { path: "pricing", element: lazyRoute(<PricingPage />) },
      { path: "admin", element: lazyRoute(<AdminPage />) },
      { path: "account", element: lazyRoute(<AccountPage />) },
      { path: "privacy", element: lazyRoute(<ContentPage page="privacy" />) },
      { path: "terms", element: lazyRoute(<ContentPage page="terms" />) },
      { path: "guidelines", element: lazyRoute(<ContentPage page="guidelines" />) },
      { path: "rules", element: lazyRoute(<ContentPage page="rules" />) },
      { path: "affiliate-disclosure", element: lazyRoute(<ContentPage page="affiliate" />) },
      { path: "contact", element: lazyRoute(<ContentPage page="contact" />) },
    ],
  },
]);
