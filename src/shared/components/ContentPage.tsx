type PageKey = "privacy" | "terms" | "guidelines" | "rules" | "affiliate" | "contact";

const copy: Record<PageKey, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy",
    body: [
      "IdeaInSept stores account, sprint, voting, showcase, entitlement, and consent records needed to operate the September Sprint Hub.",
      "Private dev logs and raw AI prompts are not sent to analytics. Legal review is required before public launch.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "Use the platform to generate ideas, track progress, and submit projects you own or are authorized to share.",
      "Sprint Pass purchases are seasonal one-time purchases. Refund and contest language requires owner-approved legal review before launch.",
    ],
  },
  guidelines: {
    title: "Community Guidelines",
    body: [
      "Share useful work, credit collaborators, avoid harassment, and submit only projects you have rights to publish.",
      "Moderators may reject submissions that are unsafe, misleading, abusive, or unrelated to the season.",
    ],
  },
  rules: {
    title: "Contest And Showcase Rules",
    body: [
      "Community choice votes and official judging are separate. Ranking, votes, awards, and visibility are never sold.",
      "The judging rubric weighs problem clarity, usefulness, execution, originality, and presentation. Legal review is required before a public contest launch.",
    ],
  },
  affiliate: {
    title: "Affiliate Disclosure",
    body: [
      "IdeaInSept may later include clearly disclosed partner links for hosting, domains, AI APIs, design tools, and developer services.",
      "Affiliate revenue must never influence showcase ranking, judging, or award decisions.",
    ],
  },
  contact: {
    title: "Contact",
    body: [
      "For moderation issues, privacy requests, sponsorship questions, or support, configure a monitored owner inbox before production launch.",
      "Until an email provider is connected, the local MVP keeps contact copy visible without sending messages.",
    ],
  },
};

export default function ContentPage({ page }: { page: PageKey }) {
  const item = copy[page];
  return (
    <article className="panel max-w-3xl p-6">
      <h1 className="text-3xl font-black">{item.title}</h1>
      {item.body.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-muted">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
