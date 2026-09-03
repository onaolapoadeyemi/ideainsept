import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

type State = { error: Error | null };
type BoundaryProps = PropsWithChildren<{ name?: string; resetKey?: string }>;

export class AppErrorBoundary extends Component<BoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route boundary caught error", { error: error.message, componentStack: info.componentStack });
  }

  componentDidUpdate(previous: BoundaryProps) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render(): ReactNode {
    if (this.state.error) {
      return <FeatureFallback title={`${this.props.name || "This feature"} stalled`} message={this.state.error.message} />;
    }
    return this.props.children;
  }
}

export function FeatureFallback({ title, message }: { title: string; message: string }) {
  return (
    <section className="panel mx-auto max-w-2xl p-6" role="alert">
      <h1 className="text-2xl font-black">{title}</h1>
      <p className="mt-3 text-muted">{message}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="button button-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
        <Link className="button button-secondary" to="/">
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <FeatureFallback title={`${error.status} ${error.statusText}`} message={error.data || "The route could not load."} />;
  }
  return <FeatureFallback title="Something broke softly" message={error instanceof Error ? error.message : "The route could not load."} />;
}
