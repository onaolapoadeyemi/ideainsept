type PageKey = "privacy" | "terms" | "guidelines" | "rules" | "affiliate" | "contact";

const copy: Record<PageKey, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "Effective September 3, 2026. IdeaInSept is operated by Crewlane Technologies LLC. This policy explains what information the service collects, why it is used, and the choices available to you.",
      "We collect account identifiers supplied through GitHub authentication, profile details you choose to publish, idea-generation inputs, saved ideas, sprint plans, daily progress logs, showcase submissions, votes, newsletter consent, support communications, and purchase entitlement records. Stripe processes payment-card information; IdeaInSept does not store complete card numbers.",
      "We use this information to authenticate users, save and synchronize work, enforce usage limits, operate the showcase, prevent duplicate votes and abuse, provide purchased access, answer support requests, and improve reliability. Private sprint logs and raw idea prompts are not sent to advertising analytics.",
      "When live AI is enabled, the minimum prompt information required to generate an idea is sent through a server-side function to the configured AI provider. Do not enter confidential, regulated, medical, financial, or other sensitive personal information into the generator.",
      "Public showcase information—including project name, pitch, links, approved creator identity, technology labels, votes, and ranking—may be visible to anyone. Draft and rejected submissions remain restricted to their owner and authorized moderators.",
      "We retain operational records while your account is active and as reasonably needed for security, legal, tax, dispute, and fraud-prevention purposes. You may request an export or deletion from your account area or by email. Some records may be retained where required by law.",
      "Service providers may process limited data on our behalf, including Supabase for authentication and database services, Netlify for hosting and server functions, an AI provider when live generation is enabled, GitHub for OAuth, and Stripe after payments are activated. Their own terms and privacy policies also apply.",
      "For privacy questions or requests, email OnaolapoAdeyemi@gmail.com with the subject “IdeaInSept Privacy.” We may update this policy as the product changes and will revise the effective date when material changes are made.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "Effective September 3, 2026. These Terms govern your use of IdeaInSept, a service operated by Crewlane Technologies LLC. By creating an account or using the service, you agree to these Terms and the Privacy Policy.",
      "You must provide accurate account information, protect access to your account, and use the service lawfully. You may not interfere with the service, evade quotas, automate abusive requests, manipulate votes, impersonate others, submit malware, or attempt unauthorized access.",
      "You retain ownership of content you create. You grant IdeaInSept a non-exclusive, worldwide, royalty-free license to host, display, reproduce, and distribute content you intentionally submit to the public showcase for operating and promoting the showcase. You may withdraw an unapproved submission; removal of published promotional material may require reasonable processing time.",
      "You represent that you own or have permission to submit all project content, links, names, images, code, and demonstrations. You are responsible for third-party licenses, privacy obligations, and claims made about your project.",
      "Generated ideas and planning suggestions are informational and may be incomplete, inaccurate, or similar to ideas available elsewhere. IdeaInSept does not promise originality, commercial success, funding, income, intellectual-property clearance, or fitness for a particular purpose.",
      "Sprint Pass payments are one-time purchases for the identified annual season and do not renew automatically. The price, included features, refund terms, and access period are shown before checkout. A pass gives access only to the premium features described on the Pricing page for that season; it does not purchase votes, ranking, awards, funding, employment, or a particular business result.",
      "14-day Sprint Pass refund policy: You may request a refund within 14 calendar days after the original purchase if the premium Sprint Pass features were materially unavailable or did not work substantially as described. To request one, email OnaolapoAdeyemi@gmail.com with the subject “IdeaInSept Refund Request,” the email used at checkout, your Stripe receipt or payment date, and a short description of the issue. Do not send payment-card information.",
      "We will acknowledge a complete refund request within 5 business days and, if approved, issue the refund to the original payment method. Your bank or card provider may take additional time to post it. A completed refund ends the Sprint Pass entitlement for the applicable season. Nothing in this policy limits any consumer right that cannot legally be limited.",
      "This satisfaction policy does not cover a change of mind after premium features have been successfully delivered, dissatisfaction with an idea’s originality or commercial outcome, normal free-tier or platform-wide AI safety limits disclosed before purchase, misuse of the service, or an account that violated these Terms. If a technical problem is fixable, we may first offer prompt support or a reasonable repair. Chargebacks and payment disputes may result in temporary loss of paid access while the matter is reviewed.",
      "The service and annual showcase may change, pause, or end. To the extent permitted by law, the service is provided without warranties and Crewlane Technologies LLC is not liable for indirect, incidental, special, consequential, or lost-profit damages. Nothing in these Terms limits rights that cannot legally be limited.",
      "Tennessee law governs these Terms without regard to conflict-of-law rules. Before filing a claim, contact OnaolapoAdeyemi@gmail.com so both parties can attempt an informal resolution.",
    ],
  },
  guidelines: {
    title: "Community Guidelines",
    body: [
      "Share useful work, credit collaborators, avoid harassment, and submit only projects you have rights to publish.",
      "Do not submit malware, deceptive links, stolen work, illegal content, sexual exploitation, threats, targeted harassment, hate content, doxxing, spam, vote manipulation, or projects designed primarily to harm people or systems.",
      "Give credit to collaborators and third-party resources. Clearly disclose material use of templates, open-source code, AI-generated material, and licensed assets when that context is important to evaluating the work.",
      "Moderators may reject, unpublish, or remove submissions that are unsafe, misleading, abusive, infringing, manipulated, unrelated to the season, or inconsistent with these guidelines. Enforcement decisions may consider context, severity, history, and community safety.",
      "Report a project or moderation concern to OnaolapoAdeyemi@gmail.com with the subject “IdeaInSept Community Report” and include the public project link and a concise explanation.",
    ],
  },
  rules: {
    title: "Contest And Showcase Rules",
    body: [
      "IdeaInSept is an annual skill-building showcase. Unless a separate official announcement expressly identifies a prize and its eligibility terms, participation does not create a promise of cash, employment, investment, sponsorship, or any item of value.",
      "Eligible entries must be submitted during the published season window, be controlled by the entrant or authorized team, include a working public demonstration, and comply with the Terms and Community Guidelines. The season record displayed in the application controls submission, voting, and judging dates.",
      "Community choice is based on eligible account votes. One account may vote once per submission. Automated voting, coordinated manipulation, purchased votes, duplicate accounts, or attempts to bypass enforcement may result in vote removal or disqualification.",
      "Official judging is separate from community voting. Judges may score problem clarity (20 points), usefulness (25), execution (25), originality (15), and presentation (15). Ties may be resolved by the higher usefulness score, then execution score, then a documented judge decision.",
      "Payment, sponsorship, affiliate relationships, and priority review never purchase votes, judging scores, ranking, featuring, or awards. Priority review, if offered, means faster moderation only.",
      "IdeaInSept may verify eligibility, request clarification, correct counting errors, remove ineligible material, and modify or cancel a season when fraud, technical failure, legal restrictions, or events outside reasonable control make fair operation impractical.",
      "Material prizes, age restrictions, geographic restrictions, tax terms, publicity releases, and no-purchase requirements must be published in season-specific official rules before any prize-based competition opens.",
    ],
  },
  affiliate: {
    title: "Affiliate Disclosure",
    body: [
      "IdeaInSept may later include clearly disclosed partner links for hosting, domains, AI APIs, design tools, and developer services.",
      "If you purchase through an affiliate link, IdeaInSept may receive compensation at no additional cost to you. Sponsored placements and affiliate links will be labeled close to the recommendation.",
      "Affiliate revenue, sponsorship, and commercial relationships never influence community vote counts, official judging, eligibility, moderation outcomes, or awards.",
      "Recommendations reflect product relevance to the stated use case, but you should evaluate pricing, terms, security, and suitability before purchasing a third-party service.",
    ],
  },
  contact: {
    title: "Contact",
    body: [
      "IdeaInSept is operated by Crewlane Technologies LLC.",
      "Email: OnaolapoAdeyemi@gmail.com",
      "For account or technical support, use the subject “IdeaInSept Support.” For privacy requests, use “IdeaInSept Privacy.” For showcase reports, use “IdeaInSept Community Report.” For sponsorship inquiries, use “IdeaInSept Sponsorship.”",
      "Include the email address associated with your account and the relevant project or page link. Do not email passwords, access tokens, payment-card information, government identifiers, medical records, or other highly sensitive information.",
      "Support is currently handled by email. Response times are not guaranteed, but urgent security and privacy reports are prioritized.",
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
      {page === "contact" ? <a className="button button-primary mt-6" href="mailto:OnaolapoAdeyemi@gmail.com?subject=IdeaInSept%20Support">Email IdeaInSept Support</a> : null}
    </article>
  );
}
