import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";
import { recordNewsletterOptIn } from "./newsletterService";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const result = await recordNewsletterOptIn({
        email,
        consentSource: "homepage_newsletter",
        currentSeasonInterest: true,
        company,
      });
      setStatus("success");
      setMessage(result.alreadySubscribed ? "That email is already on the IdeaInSept list." : "You’re on the list. We’ll share season dates, builder prompts, and showcase updates.");
      setEmail("");
      setConsent(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not save your signup. Please try again.");
    }
  }

  return (
    <section className="panel border-amber-400/40 p-6 sm:p-8" aria-labelledby="newsletter-title">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-amber-300"><Mail size={19} aria-hidden="true" /><span className="text-sm font-bold uppercase tracking-[0.16em]">Community newsletter</span></div>
          <h2 id="newsletter-title" className="mt-3 text-2xl font-black sm:text-3xl">Keep your September momentum.</h2>
          <p className="mt-3 max-w-2xl text-muted">Get registration-opening dates, practical builder prompts, showcase updates, and the next season’s announcement. The sprint ends; the builder community does not.</p>
        </div>
        <form className="grid min-w-0 gap-3 lg:w-[26rem]" onSubmit={submit} noValidate>
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
          <label className="flex items-start gap-2 text-xs leading-5 text-muted">
            <input className="mt-1" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
            <span>I agree to receive IdeaInSept community and season updates. I can opt out by contacting support.</span>
          </label>
          <label className="sr-only" htmlFor="newsletter-company">Company</label>
          <input id="newsletter-company" className="hidden" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
          <button className="button button-primary" disabled={status === "saving" || !consent}>
            <Send size={17} aria-hidden="true" />
            {status === "saving" ? "Joining…" : "Join the community"}
          </button>
          {message ? <p className={status === "error" ? "text-sm text-rose-300" : "text-sm text-emerald-300"} role="status">{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
