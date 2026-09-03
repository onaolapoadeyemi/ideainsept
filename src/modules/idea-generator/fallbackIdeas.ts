import { GeneratedIdea, IdeaRequest } from "./types";

type Template = Omit<GeneratedIdea, "id" | "source" | "confidence"> & {
  tags: string[];
  buildTypes: string[];
  minHours: number;
  experience: string[];
};

const rawTemplates: Array<
  [
    string,
    string,
    string,
    string,
    string,
    string[],
    string,
    string[],
    string[],
    string,
    string,
    Template["complexity"],
  ]
> = [
  ["SprintPulse", "A minimal progress tracker for indie developers shipping one September project.", "Side projects sprawl until builders lose the thread.", "Independent developers", "A focused sprint board with daily logs, scope locks, and launch prompts.", ["typescript", "react"], "Ship one useful tracker with auth, daily logs, and a public progress snapshot.", ["Validate the log loop", "Build sprint calendar", "Add showcase submission", "Launch with three builders"], ["React", "Supabase", "Netlify"], "$29 seasonal pass for export and private notes.", "September gives the product a real 30-day promise.", "medium"],
  ["ClinicQueue Lite", "A no-cost waitlist and callback tracker for tiny community clinics.", "Front desks juggle callbacks in notebooks and lose context.", "Small nonprofit clinics", "A simple queue, callback status, and printable daily sheet.", ["health", "operations"], "Keep it non-medical: no diagnoses, just contact workflow.", ["Interview staff", "Build queue states", "Add print view", "Pilot with one desk"], ["React", "Postgres", "Netlify"], "Monthly fee for clinics after pilot.", "Autumn flu season makes operations pain visible.", "medium"],
  ["GrantKit Builder", "A grant-application checklist for local nonprofits.", "Tiny teams miss required attachments and deadlines.", "Nonprofit operators", "Reusable grant templates, deadline reminders, and document status.", ["writing", "nonprofit"], "Launch with three grant templates and manual reminders.", ["Collect templates", "Build checklist", "Add export", "Publish resource guide"], ["React", "Supabase"], "Paid templates and cohort support.", "September planning season helps nonprofits prep Q4.", "low"],
  ["RepoReadiness", "A launch-readiness audit for GitHub projects.", "Builders do not know if their repo looks trustworthy.", "Open-source maintainers", "Scan public repo metadata and return a launch checklist.", ["github", "developer"], "Use public GitHub URLs and deterministic scoring.", ["Define rubric", "Build scanner", "Add share cards", "Launch on dev forums"], ["Vite", "GitHub API"], "One-time audit pack or team plan.", "Perfect for pre-launch cleanup before autumn demos.", "medium"],
  ["InvoiceNudge", "A polite invoice follow-up planner for freelancers.", "Freelancers avoid awkward follow-ups and wait too long.", "Solo service providers", "Generate follow-up schedules and copy snippets without sending email.", ["freelance", "writing"], "Build templates, calendar export, and client status fields.", ["Validate copy", "Build planner", "Add export", "Launch to freelancers"], ["React", "Supabase"], "Paid template packs.", "September resets client pipelines after summer.", "low"],
  ["LocalMenu Monitor", "A change tracker for small restaurant menus.", "Local diners and owners miss seasonal specials.", "Local food fans", "Track public menu URLs and summarize visible changes.", ["local", "automation"], "Manual URL checks and owner-submitted updates first.", ["Collect URLs", "Build diff view", "Add subscriptions", "Launch city beta"], ["Netlify Functions", "Postgres"], "Local sponsorships after traction.", "Autumn specials create a timely hook.", "medium"],
  ["AccessMap Notes", "A lightweight accessibility notes page for venues.", "People need practical access details not buried in reviews.", "Event organizers and attendees", "Structured venue notes with entrance, seating, restroom, and transit fields.", ["accessibility"], "Launch as moderated community notes for one city.", ["Define schema", "Build submission", "Add moderation", "Publish first guide"], ["React", "Supabase"], "Sponsored venue verification later.", "Fall event season increases planning needs.", "medium"],
  ["ClassroomKit Swap", "A resource exchange for teachers building September routines.", "Teachers recreate the same classroom templates every year.", "Educators", "Share tagged templates, routines, and reflection notes.", ["education", "content"], "Start with curated templates and submission moderation.", ["Curate resources", "Build library", "Add submissions", "Launch teacher list"], ["React", "Supabase"], "Paid template bundles.", "Back-to-school timing is natural without feeling gimmicky.", "low"],
  ["VetSkill Bridge", "A portfolio translator for veterans moving into tech.", "Military experience is hard to explain in civilian product terms.", "Veterans and career coaches", "Convert roles into project ideas and portfolio narratives.", ["veteran", "career"], "Build guided prompts and saved portfolio cards.", ["Interview coaches", "Build translator", "Add export", "Launch with partners"], ["React", "Supabase"], "Sponsored cohorts or coaching referrals.", "September hiring cycles create urgency.", "medium"],
  ["DataTiny", "A spreadsheet-to-dashboard starter for one-person businesses.", "Small operators need insights but live in spreadsheets.", "Local business owners", "Upload-free CSV paste, charts, and a shareable summary.", ["data", "business"], "Use pasted CSV only to avoid storage cost.", ["Define charts", "Build parser", "Add insights", "Launch examples"], ["React", "Zod"], "Paid dashboard templates.", "Q4 planning starts in September.", "medium"],
  ["StudySprint", "A 30-day project-based learning tracker for students.", "Students collect tutorials but rarely finish a portfolio build.", "Students", "Pair one project idea with daily learning and build logs.", ["education", "student"], "Launch with GitHub OAuth and local streak recovery.", ["Validate journey", "Build tracker", "Add showcase", "Campus launch"], ["React", "Supabase"], "School cohort packages later.", "September school rhythm is a strong anchor.", "low"],
  ["DeployMate", "A preflight checklist for zero-downtime launches.", "Small teams skip launch checks until production is tense.", "Technical founders", "Environment, rollback, DNS, and observability checklist by stack.", ["devops", "saas"], "Build deterministic checklists and saved launch runs.", ["Define rubrics", "Build runbook", "Add exports", "Launch to founders"], ["React", "Supabase"], "Paid team workspaces later.", "Autumn launch windows reward preparation.", "medium"],
  ["FocusFrame", "A calm deep-work session tracker for makers.", "Builders confuse busy time with product progress.", "Creators and developers", "Link time blocks to sprint outcomes and next actions.", ["productivity"], "No medical claims; focus on planning and reflection.", ["Prototype sessions", "Build logs", "Add reports", "Launch with builders"], ["React", "Local-first"], "Sprint Pass-style seasonal reports.", "September routines make focus easier to sell.", "low"],
  ["SponsorBrief", "A sponsorship package builder for niche newsletters.", "Creators do not know how to price and present sponsorships.", "Newsletter creators", "Generate inventory, rate cards, and sponsor fit notes.", ["creator", "content"], "Manual inputs and PDF-ready copy.", ["Research packages", "Build form", "Add rate card", "Launch samples"], ["React", "Supabase"], "Paid export templates.", "Brands plan Q4 campaigns in September.", "medium"],
  ["BugBash Board", "A tiny bug triage room for weekend product launches.", "Solo builders need lightweight QA without Jira overhead.", "Indie hackers", "Public bug intake, severity labels, and launch-blocker view.", ["developer", "qa"], "Launch with URL submissions and owner moderation.", ["Define states", "Build board", "Add public intake", "Launch beta"], ["React", "Supabase"], "Paid private projects.", "September shipping creates real QA pressure.", "medium"],
  ["HomeLab Ledger", "An inventory and maintenance tracker for home IoT labs.", "Makers forget device firmware, sensors, and spare parts.", "Hardware hobbyists", "Track devices, firmware dates, and project notes.", ["hardware", "iot"], "No uploads; validated external docs and repo URLs.", ["Define inventory", "Build CRUD", "Add reminders", "Launch makers"], ["React", "Supabase"], "Paid export and templates.", "Autumn indoor project season is a practical angle.", "medium"],
  ["CivicFix Log", "A public issue tracker for neighborhood improvement projects.", "Small civic groups lose track of requests and follow-up.", "Neighborhood organizers", "Submit, tag, and update local improvement tasks.", ["community", "local"], "Moderated public feed with owner-managed statuses.", ["Interview organizers", "Build submit flow", "Add moderation", "Launch district"], ["React", "Supabase"], "Sponsored civic pages later.", "September meetings restart after summer.", "medium"],
  ["ApiCost Guard", "A free-tier usage alarm dashboard for side projects.", "Builders accidentally turn free experiments into bills.", "Developers using APIs", "Manual quota config, kill-switch checklist, and alert thresholds.", ["security", "developer", "api", "cost"], "Start with manual entries and deterministic warnings.", ["Define quota model", "Build dashboard", "Add export", "Launch guide"], ["React", "Supabase"], "Paid team templates.", "Budget discipline matters before Q4 experiments.", "medium"],
  ["LaunchLore", "A case-study generator for shipped side projects.", "Builders ship but fail to tell a useful story.", "Technical founders", "Guide problem, constraints, tradeoffs, screenshots, and results.", ["writing", "saas"], "Build forms and publishable markdown export.", ["Define story schema", "Build editor", "Add export", "Launch examples"], ["React"], "Paid portfolio templates.", "September launches deserve public proof.", "low"],
  ["CareCircle Tasks", "A coordination board for non-medical family support.", "Families helping elders coordinate errands through scattered texts.", "Family caregivers", "Task lists, visits, notes, and boundaries with no medical data.", ["community", "health"], "Keep it explicitly non-medical and privacy-conscious.", ["Validate needs", "Build board", "Add invites", "Launch guide"], ["React", "Supabase"], "Paid family plan later.", "Autumn schedule changes surface coordination gaps.", "high"],
  ["FounderFAQ", "A living FAQ for early customers.", "Founders repeat the same explanations in sales calls.", "Solo SaaS founders", "Collect questions, draft answers, publish clean FAQ pages.", ["saas", "support"], "Launch with manual Q&A and public page export.", ["Collect Qs", "Build editor", "Add public page", "Launch to founders"], ["React", "Supabase"], "Paid branding and analytics.", "September demos produce repeat questions.", "low"],
  ["OpsRecipe Box", "A reusable SOP builder for tiny teams.", "Operations knowledge disappears in chats and memory.", "Small service teams", "Structured recipes with owner, steps, risks, and update dates.", ["automation", "ops"], "Launch with markdown-safe rendering and export.", ["Define SOP format", "Build library", "Add review dates", "Launch samples"], ["React", "Supabase"], "Paid templates.", "Q4 readiness makes SOPs urgent.", "medium"],
  ["TinyCRM Pulse", "A relationship follow-up tracker for makers.", "Founders forget warm leads after events and launches.", "Indie founders", "Simple contacts, context, and next touch date.", ["saas", "sales"], "Avoid email sending; track and export reminders.", ["Build contact model", "Add reminders", "Add import", "Launch"], ["React", "Supabase"], "Sprint Pass or paid CRM lite.", "September event season creates new leads.", "medium"],
  ["PromptGarden", "A prompt version notebook for practical AI workflows.", "Useful prompts get lost and results cannot be reproduced.", "AI-assisted builders", "Version prompts, use cases, and observed output quality.", ["ai", "developer"], "No secret storage; text only with private visibility.", ["Define model", "Build notebook", "Add compare", "Launch to AI builders"], ["React", "Supabase"], "Paid private libraries.", "September build sprints need repeatable AI workflows.", "medium"],
  ["SchoolClub Sites", "A static site starter for student clubs.", "Clubs need a web presence but lack maintainers.", "Student organizations", "Guided one-page site content and deployment checklist.", ["education", "web"], "Generate content locally and export files.", ["Interview clubs", "Build generator", "Add checklist", "Launch campus"], ["React"], "Paid setup service or templates.", "Back-to-school club fairs need sites.", "low"],
  ["RepairRadar", "A maintenance tracker for shared community tools.", "Makerspaces lose track of broken tools and owners.", "Makerspace managers", "Tool status, repair notes, and member-visible availability.", ["hardware", "community"], "No uploads; URL-based manuals and photos first.", ["Define statuses", "Build board", "Add reports", "Pilot"], ["React", "Supabase"], "Paid makerspace plan.", "Fall workshop season raises tool demand.", "medium"],
  ["MicroCourse Map", "A planning canvas for creators selling tiny courses.", "Creators overbuild courses before validating demand.", "Technical educators", "Map promise, lessons, proof, and presale page copy.", ["content", "education"], "Launch with templates and public outline preview.", ["Validate format", "Build canvas", "Add export", "Launch"], ["React"], "Paid course templates.", "September learning energy supports launches.", "low"],
  ["OpenSource Onramp", "A good-first-issue campaign planner.", "Maintainers want contributors but lack onboarding structure.", "Open-source maintainers", "Plan issues, docs, labels, and contributor welcome flows.", ["developer", "community"], "Use public repo links and deterministic checklists.", ["Define rubric", "Build planner", "Add share", "Launch"], ["React", "GitHub"], "Sponsor-backed maintainer resources later.", "Hacktober prep starts in September.", "medium"],
  ["CarbonLite Trips", "A low-friction commute experiment tracker.", "People want greener routines but need practical experiments.", "Commuters and campus groups", "Plan one-week commute trials and compare time, cost, comfort.", ["data", "local"], "Avoid medical/safety claims; focus on personal logs.", ["Define metrics", "Build tracker", "Add report", "Launch"], ["React"], "School or workplace cohort later.", "September routine reset is a natural hook.", "medium"],
  ["ClientPortal One", "A tiny client status portal for solo agencies.", "Clients ask for updates because progress is invisible.", "Freelancers and agencies", "Share milestones, current focus, decisions, and next dates.", ["saas", "freelance"], "Unlisted URLs and no file uploads for free MVP.", ["Validate needs", "Build portal", "Add auth", "Launch"], ["React", "Supabase"], "Paid private portals.", "Post-summer client work needs visibility.", "high"],
  ["DomainDecision", "A decision log for picking product names and domains.", "Founders churn on names without criteria.", "Indie makers", "Compare names, domain status notes, risks, and audience fit.", ["branding", "saas"], "Manual checks and scoring first; no paid domain API.", ["Define criteria", "Build comparator", "Add export", "Launch"], ["React"], "Affiliate domain links only with disclosure.", "September launch deadlines force naming decisions.", "low"],
];

const templates: Template[] = rawTemplates.map(([title, promise, painfulProblem, targetUser, solution, tags, septemberScope, weeklyOutline, recommendedStack, monetizationPath, launchAngle, complexity]) => ({
  title,
  promise,
  painfulProblem,
  targetUser,
  solution,
  tags: tags as string[],
  buildTypes: ["surprise", ...(tags as string[])],
  minHours: 3,
  experience: ["beginner", "intermediate", "advanced"],
  builderFit: "This matches your stated skills and can be scoped to a September build without paid infrastructure.",
  septemberScope,
  weeklyOutline,
  recommendedStack,
  monetizationPath,
  launchAngle,
  complexity: complexity as "low" | "medium" | "high",
}));

export function matchFallbackIdeas(request: IdeaRequest, count: number): GeneratedIdea[] {
  const haystack = `${request.skills} ${request.interests ?? ""} ${request.audience ?? ""} ${request.buildType}`.toLowerCase();
  return templates
    .map((template, index) => {
      const keywordScore = template.tags.reduce((score, tag) => score + (haystack.includes(tag.toLowerCase()) ? 6 : 0), 0);
      const buildScore = template.buildTypes.includes(request.buildType) ? 5 : request.buildType === "surprise" ? 2 : 0;
      const timeScore = request.hoursPerWeek >= template.minHours ? 2 : -2;
      const experienceScore = template.experience.includes(request.experienceLevel) ? 2 : 0;
      return { template, score: keywordScore + buildScore + timeScore + experienceScore - index * 0.01 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ template }, index) => ({
      id: `curated-${template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
      title: template.title,
      promise: template.promise,
      painfulProblem: template.painfulProblem,
      targetUser: template.targetUser,
      solution: template.solution,
      builderFit: template.builderFit,
      septemberScope: template.septemberScope,
      weeklyOutline: template.weeklyOutline,
      recommendedStack: template.recommendedStack,
      monetizationPath: template.monetizationPath,
      launchAngle: template.launchAngle,
      complexity: template.complexity,
      confidence: 78,
      source: "curated",
    }));
}
