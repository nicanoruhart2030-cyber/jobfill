import type { SwipeJob } from "@/lib/types";

const RAW: Omit<SwipeJob, "id" | "match_score" | "salary_min" | "salary_max" | "salary_display">[] = [
  {
    title: "Software Engineering Intern",
    company: "Stripe",
    location: "Remote Canada",
    job_type: "Internship",
    apply_url: "https://stripe.com/jobs/listing/software-engineering-intern",
    description:
      "Build customer-facing infrastructure that powers internet commerce. Ship to production in your first weeks.",
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Junior Product Manager",
    company: "Shopify",
    location: "Ottawa, ON",
    job_type: "Full-time",
    apply_url: "https://www.shopify.com/careers/junior-product-manager",
    description:
      "Drive product decisions for Shopify's B2B merchant tooling. Partner with engineering, design, and data.",
    tags: ["B2B SaaS", "Growth", "Analytics"],
  },
  {
    title: "AI/ML Research Intern",
    company: "Cohere",
    location: "Toronto, ON",
    job_type: "Internship",
    apply_url: "https://jobs.lever.co/cohere/ai-ml-research-intern",
    description:
      "Work on frontier large language model research. Run experiments and collaborate on architecture.",
    tags: ["PyTorch", "LLMs", "Python"],
  },
  {
    title: "Front-end Developer",
    company: "Wealthsimple",
    location: "Toronto, ON",
    job_type: "Full-time",
    apply_url: "https://jobs.lever.co/wealthsimple/frontend-developer",
    description:
      "Ship surfaces millions of Canadians use to invest, trade, and bank. Focus on accessibility and performance.",
    tags: ["React", "TypeScript", "Fintech"],
  },
  {
    title: "Growth Analyst",
    company: "Clearco",
    location: "Remote",
    job_type: "Full-time",
    apply_url: "https://jobs.lever.co/clearco/growth-analyst",
    description:
      "Own analytics for GTM. Build SQL/Python pipelines and turn data into channel decisions.",
    tags: ["SQL", "Python", "B2B"],
  },
  {
    title: "Software Developer Co-op",
    company: "Faire",
    location: "Kitchener, ON",
    job_type: "Co-op",
    apply_url: "https://boards.greenhouse.io/faire/jobs/software-developer-coop",
    description:
      "Help independent retailers thrive. Work across Ruby and React on marketplace tooling.",
    tags: ["Ruby", "React", "APIs"],
  },
  {
    title: "Data Engineer",
    company: "RBC",
    location: "Toronto, ON",
    job_type: "Full-time",
    apply_url: "https://jobs.rbc.com/ca/en/job/data-engineer",
    description:
      "Design data pipelines for Canada's largest bank. Spark, Python, and warehousing.",
    tags: ["Spark", "Python", "SQL"],
  },
  {
    title: "Full Stack Intern",
    company: "Properly",
    location: "Remote",
    job_type: "Internship",
    apply_url: "https://boards.greenhouse.io/properly/jobs/full-stack-intern",
    description:
      "Reinvent how Canadians buy and sell homes. Next.js + Supabase end-to-end.",
    tags: ["Next.js", "Supabase", "PropTech"],
  },
];

const DISPLAY = [
  "$45–55/hr",
  "$75–90k",
  "$40–50/hr",
  "$85–105k",
  "$65–80k",
  "$38–44/hr",
  "$90–110k",
  "$35–42/hr",
];

export function seedSwipeJobs(): SwipeJob[] {
  return RAW.map((j, i) => ({
    ...j,
    id: `seed-${i}`,
    salary_min: null,
    salary_max: null,
    salary_display: DISPLAY[i] ?? "Competitive",
    match_score: 68 + ((i * 7) % 28),
  }));
}
