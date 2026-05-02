"""Video angles and social caption templates."""

from __future__ import annotations

from typing import Any, TypedDict


class VideoAngle(TypedDict, total=False):
    id: str
    title: str
    hook: str
    concept: str
    cta: str
    duration: int
    aspect: str


VIDEO_ANGLES: list[dict[str, Any]] = [
    {
        "id": "swipe_demo",
        "title": "POV: job applications in 2026",
        "hook": "I applied to 47 jobs in one morning.",
        "concept": (
            "Screen recording style — someone opens JobFill, "
            "swipes right on 10 jobs, all get submitted. "
            "Clock shows 8 minutes elapsed."
        ),
        "cta": "jobfill.vercel.app",
        "duration": 15,
        "aspect": "9:16",
    },
    {
        "id": "sprout_comparison",
        "title": "Why Sprout corrupts your resume",
        "hook": "Your resume looks fine to you. Here's what the recruiter sees.",
        "concept": (
            "Split screen: left shows clean PDF, right shows "
            "Sprout's reconstructed mess. Then JobFill submitting "
            "the original file perfectly."
        ),
        "cta": "jobfill.vercel.app",
        "duration": 20,
        "aspect": "9:16",
    },
    {
        "id": "rejection_ratio",
        "title": "The numbers game is real",
        "hook": "Top engineers apply to 150+ jobs to get 1 offer.",
        "concept": (
            "Animated stats: 150 applications → 12 callbacks → "
            "3 interviews → 1 offer. Then: JobFill does 150 "
            "applications while you sleep."
        ),
        "cta": "jobfill.vercel.app",
        "duration": 15,
        "aspect": "9:16",
    },
    {
        "id": "ats_explainer",
        "title": "Why your application gets auto-rejected",
        "hook": "Nobody is reading your resume. A robot is.",
        "concept": (
            "Animation of ATS parsing a resume, flagging fields. "
            "JobFill fills every field correctly because it "
            "knows how Greenhouse, Lever, and Workday work."
        ),
        "cta": "jobfill.vercel.app",
        "duration": 20,
        "aspect": "9:16",
    },
    {
        "id": "cover_letter",
        "title": "Stop writing the same cover letter 50 times",
        "hook": "I used to spend 20 minutes per cover letter.",
        "concept": (
            "Timer ticking up for manual cover letter writing. "
            "Then JobFill reading the JD and generating one "
            "in 4 seconds. Side-by-side quality comparison."
        ),
        "cta": "jobfill.vercel.app",
        "duration": 15,
        "aspect": "9:16",
    },
    {
        "id": "morning_routine",
        "title": "My morning routine got me 6 callbacks in a week",
        "hook": "Wake up. Open JobFill. Swipe for 5 minutes. Go to class.",
        "concept": (
            "Morning bedroom scene → phone → swipe UI → "
            "notification '6 applications submitted' — "
            "all while eating breakfast."
        ),
        "cta": "jobfill.vercel.app",
        "duration": 20,
        "aspect": "9:16",
    },
    {
        "id": "salary_visible",
        "title": "Stop applying to jobs with hidden salaries",
        "hook": "JobFill shows salary before you swipe.",
        "concept": (
            "Job card with salary front and center in monospace style. "
            "Swipe right on $95-120k. Swipe left on hidden/low. "
            "Dashboard showing only good-salary applications."
        ),
        "cta": "jobfill.vercel.app",
        "duration": 12,
        "aspect": "9:16",
    },
]

CAPTION_TEMPLATES: dict[str, str] = {
    "swipe_demo": (
        "applied to 47 jobs before my first class. no, seriously.\n\n"
        "jobfill.vercel.app\n\n"
        "#jobsearch #jobs #career #cs #intern"
    ),
    "sprout_comparison": (
        "sprout corrupts your resume when it uploads it. "
        "here's the proof and the fix.\n\n"
        "jobfill.vercel.app\n\n"
        "#jobsearch #resume #ats #recruiting"
    ),
    "rejection_ratio": (
        "the numbers are brutal but the math works in your favor "
        "if you move fast enough.\n\n"
        "jobfill.vercel.app\n\n"
        "#jobhunting #tech #softwareengineer #internship"
    ),
    "ats_explainer": (
        "nobody is reading your resume first. an ats is. "
        "here is what actually happens.\n\n"
        "jobfill.vercel.app\n\n"
        "#ats #recruiting #resume #jobsearch"
    ),
    "cover_letter": (
        "i was writing the same cover letter 50 times. "
        "then i stopped.\n\n"
        "jobfill.vercel.app\n\n"
        "#coverletter #jobsearch #ai #productivity"
    ),
    "morning_routine": (
        "5 minutes in the morning. 47 applications. "
        "you do the math.\n\n"
        "jobfill.vercel.app\n\n"
        "#morning #routine #jobs #hustle #grind"
    ),
    "salary_visible": (
        "stop wasting time on roles that hide the comp. "
        "swipe with your eyes open.\n\n"
        "jobfill.vercel.app\n\n"
        "#salary #jobsearch #transparency #techjobs"
    ),
}
