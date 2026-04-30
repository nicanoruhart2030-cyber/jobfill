-- Seed the 8 spec jobs into public.jobs.
-- Idempotent via ats_url unique index.

insert into public.jobs (title, company, location, salary_range, job_type, ats_url, description, tags, source)
values
  ('Software Engineering Intern', 'Stripe', 'Remote Canada', '$45–55/hr', 'Internship',
    'https://stripe.com/jobs/listing/software-engineering-intern',
    'Build customer-facing infrastructure that powers internet commerce. You''ll ship to production in your first weeks, working alongside engineers who care about correctness, performance, and developer experience.',
    array['React', 'Node.js', 'PostgreSQL'], 'seed'),

  ('Junior Product Manager', 'Shopify', 'Ottawa, ON', '$75–90k', 'Full-time',
    'https://www.shopify.com/careers/junior-product-manager',
    'Drive product decisions for Shopify''s B2B merchant tooling. Partner with engineering, design, and data to ship features that move conversion and retention metrics.',
    array['B2B SaaS', 'Growth', 'Analytics'], 'seed'),

  ('AI/ML Research Intern', 'Cohere', 'Toronto, ON', '$40–50/hr', 'Internship',
    'https://jobs.lever.co/cohere/ai-ml-research-intern',
    'Work on frontier large language model research. Run experiments, contribute to open-source tooling, and collaborate with PhDs on model architecture and training improvements.',
    array['PyTorch', 'LLMs', 'Python'], 'seed'),

  ('Front-end Developer', 'Wealthsimple', 'Toronto, ON', '$85–105k', 'Full-time',
    'https://jobs.lever.co/wealthsimple/frontend-developer',
    'Ship the surfaces millions of Canadians use to invest, trade, and bank. Focus on accessibility, performance, and design systems for high-trust fintech workflows.',
    array['React', 'TypeScript', 'Fintech'], 'seed'),

  ('Growth Analyst', 'Clearco', 'Remote', '$65–80k', 'Full-time',
    'https://jobs.lever.co/clearco/growth-analyst',
    'Own the analytics that drive Clearco''s GTM motion. Build SQL/Python pipelines, design experiments, and turn data into pricing and channel decisions.',
    array['SQL', 'Python', 'B2B'], 'seed'),

  ('Software Developer Co-op', 'Faire', 'Kitchener, ON', '$38–44/hr', 'Co-op',
    'https://boards.greenhouse.io/faire/jobs/software-developer-coop',
    'Help independent retailers thrive by building wholesale marketplace tooling. You''ll work across Ruby and React, owning end-to-end product slices.',
    array['Ruby', 'React', 'APIs'], 'seed'),

  ('Data Engineer', 'RBC', 'Toronto, ON', '$90–110k', 'Full-time',
    'https://jobs.rbc.com/ca/en/job/data-engineer',
    'Design and operate data pipelines for Canada''s largest bank. Spark, Python, and modern warehousing on critical financial workloads with strict reliability requirements.',
    array['Spark', 'Python', 'SQL'], 'seed'),

  ('Full Stack Intern', 'Properly', 'Remote', '$35–42/hr', 'Internship',
    'https://boards.greenhouse.io/properly/jobs/full-stack-intern',
    'Reinvent how Canadians buy and sell homes. Ship features end-to-end across Next.js + Supabase, working closely with senior engineers from day one.',
    array['Next.js', 'Supabase', 'PropTech'], 'seed')
on conflict (ats_url) do nothing;
