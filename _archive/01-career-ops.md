# Career-Ops: An AI Job Search Pipeline

**One-liner:** A multi-agent system I built to evaluate job offers the way a seasoned recruiter would — scoring 6 dimensions, generating tailored CVs, and tracking every interaction across a canonical state machine. Built to find me a high-fit role without drowning in noise.

**Role:** Sole builder and user. Forked and heavily customized from [santifer's career-ops](https://github.com/santifer/career-ops).
**Stack:** Claude Code (multi-agent), Node.js, Playwright, YAML/Markdown as data, Greenhouse/Lever/Ashby APIs.
**Status:** In production. Running on my own job search since April 2026.

---

## TL;DR

> I'm a finance executive (MBA IE, ex-Rappi Card, ex-Grupo MAG) who also builds production software. Instead of applying to 200 jobs blindly, I built an agentic pipeline that enforces quality over quantity. In its first week it processed 30 offers from 45+ portals, auto-discarded 14 that violated my remote-only filter, and surfaced 2 strong matches (≥4.0/5) — one of which I applied to with a tailored CV generated in seconds.
>
> **This case study is not about the code. It's about what happens when an executive who understands FP&A, ops, and recruiter psychology gets to design the system that filters his own career.**

---

## The Problem

Traditional job search is broken for senior candidates in a specific way:

1. **Signal is buried.** 70% of "remote" postings are actually US-only, hybrid, or on-site with a remote wrapper. A candidate based in Mexico has to manually read every single JD to filter.
2. **Applying blind is a tax on recruiters and on yourself.** Spray-and-pray applications waste everyone's time and destroy your win rate.
3. **Tailoring CVs by hand doesn't scale.** A genuinely tailored CV takes 1–2 hours. Do that 50 times and you've spent a month on formatting.
4. **Tracking gets lost.** What did I apply to? What's the status? When should I follow up? The answer is usually "no idea" by week 3.

I wanted a system that would let me evaluate *more* offers while submitting *fewer* — and make each submission stronger than a hand-crafted one.

---

## The Approach

Career-ops is a set of 13 modes (scan, pipeline, batch, oferta, apply, tracker, contacto, deep, pdf, project, training, ofertas, auto-pipeline) that together behave like a small team: a scout, an analyst, a recruiter, and an ops manager. Each mode is a prompt template the agent reads before acting.

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   SCAN       │─────▶│   PIPELINE   │─────▶│    BATCH     │
│  45+ portals │      │  dedup +     │      │  parallel    │
│  Greenhouse  │      │  remote-only │      │  workers,    │
│  Lever, YC   │      │  filter      │      │  A-F score   │
└──────────────┘      └──────────────┘      └──────────────┘
                                                    │
                                                    ▼
                      ┌──────────────┐      ┌──────────────┐
                      │   TRACKER    │◀─────│   REPORTS    │
                      │  canonical   │      │  6 dimensions│
                      │  state       │      │  STAR stories│
                      │  machine     │      │  CV match    │
                      └──────────────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │     PDF      │
                      │  ATS-ready   │
                      │  tailored CV │
                      │  (Playwright)│
                      └──────────────┘
```

**Key design decisions:**

- **Filesystem as database.** No SQL, no vendor lock-in. Markdown + YAML + TSV is versionable, diffable, and legible by a human at any step. A recruiter could audit my pipeline in 15 minutes.
- **Playwright for verification, not WebFetch.** The system refuses to trust WebSearch/WebFetch to confirm an offer is still live — it has to navigate to the page and read the DOM. I caught 2 dead postings (Ramp) that way in the first week.
- **Archetype matching before scoring.** Every candidate has 3–6 "archetypes" (Operations Lead, PM Fintech, Strategy Chief of Staff, etc.). An offer is scored against the closest archetype, not against a generic fit function. This is how a good recruiter actually works.
- **Ethical hard stop at submit.** The system can fill forms, draft cover letters, and prep LinkedIn outreach. It refuses to click submit. Every application passes through my eyes.

---

## Real Results (first week)

| Metric | Value |
|---|---|
| Offers scanned | **30** across Greenhouse, Lever, Ashby, YC Work at Startup, direct company boards |
| Auto-discarded (remote policy) | **14** — Berlin, SF, Barcelona, London, SF-hybrid |
| Reports generated (full 6-dimension eval) | **6** with STAR+R stories, gap analysis, comp benchmarks |
| Dead postings caught by Playwright verification | **2** (Ramp — both 404s) |
| High-fit matches (score ≥4.0/5) | **2** (Vercel FP&A 4.3, Deel Staff PO 4.2) |
| Applications submitted | **1** (Vercel FP&A + LinkedIn outreach to Sr. Director of Finance) |
| Time spent by me | **~3 hours total**, mostly reviewing reports |

**What those numbers mean:**

- My filter-to-submit ratio is **1 in 30**, not 1 in 2. That's the whole point.
- Every submission carries a tailored CV, a 15-page evaluation report, and a LinkedIn contact plan. This replaces roughly 4 hours of manual work per application with 10 minutes of review.
- I am applying to **fewer** roles than I would manually — and I sleep better because of it.

---

## What I Learned

**1. The hardest part isn't the code. It's saying no to your own cognitive biases.**
When the system scored Airtable's Head of Partnerships at 2.5/5 I wanted to override it. The scoring was right — remote-US-only blocked me before I could even get to the interview. The system protected me from my own optimism.

**2. "Remote" is a lie 70% of the time.**
Hard-filtering for remote-only (not remote-US, not hybrid, not on-site with "occasional travel") cuts the queue by more than half. Every senior candidate I know wastes hours on this.

**3. Multi-agent doesn't mean complex.**
There are no frameworks here. No LangChain, no LangGraph, no orchestration layer. Just well-scoped prompt files and a handful of Node scripts. The "multi-agent" is Claude Code reading a different mode file depending on the task.

**4. The fastest CV I have ever generated was better than my hand-written one.**
Because the system reads my full profile, my proof points, and the JD at the same time — something I can't hold in my head simultaneously — it made connections I'd missed. The Vercel FP&A CV called out "tech-forward operator who builds with Claude" as the match for their "AI-first FP&A" requirement. I had never framed my builder skills as a finance differentiator. The system saw it.

---

## Tradeoffs

- **No live dashboard (yet).** Everything is markdown. Good for audit, bad for a demo GIF. Next iteration: a static Next.js dashboard on Vercel.
- **Playwright is slow.** Each verification takes 3–5 seconds. For a batch of 50 offers that's 4 minutes. Acceptable for my use case, would be painful at 1000/day.
- **Ethical ceiling on automation.** The system explicitly cannot submit. That's a feature, not a bug, but it means the final mile is manual. For a spam-optimized search tool this would be a deal breaker.

---

## Stack

- **Claude Code** (Opus/Sonnet) for all reasoning
- **Node.js** + Playwright for verification, PDF generation, scraping
- **YAML** for config (profile, portals, archetypes)
- **Markdown + TSV** as the data layer (applications, reports, scan history)
- **Greenhouse / Lever / Ashby public APIs** for portal scanning
- **HTML/CSS template** + Playwright print-to-PDF for ATS-ready CVs

No databases. No vendor lock-in. Forkable by any technical candidate in under an hour.

---

## Why this case study matters (the meta-point)

Most portfolio projects from finance/ops executives are decks. Most portfolio projects from engineers are CRUD apps.

This is a portfolio project from **a finance executive who builds production software** — applied to the problem of landing his next role. The system *itself* is the proof point that the framing "executive who builds" is not marketing: it's a habit.

If a company is hiring a senior ops, product, or FP&A role and the candidate shows up with an AI-powered pipeline they built and used to find the company — that is a different signal than a polished deck.

---

## Links

- **Code:** _(to add — this repo will be made public)_
- **Live demo:** _(to add — static dashboard planned on Vercel)_
- **Original project by santifer:** github.com/santifer/career-ops
- **My CV (ATS-ready, generated by this system):** _(link)_
- **LinkedIn:** linkedin.com/in/manuel-de-asis
