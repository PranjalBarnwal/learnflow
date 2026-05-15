# LearnFlow Development Roadmap

> Comprehensive sprint-by-sprint guide for building LearnFlow from scratch

---

## 📋 Overview

This roadmap breaks down the LearnFlow project into **6 focused sprints** over **12-14 days**. Each sprint document contains detailed phases, tasks, acceptance criteria, and implementation notes.

---

## 🗓️ Sprint Timeline

| Sprint | Duration | Focus Area | Key Deliverables |
|--------|----------|------------|------------------|
| **[Sprint 1](./SPRINT_1_FOUNDATION.md)** | 2 days | Foundation & Auth | Project setup, database, NextAuth, login/register |
| **[Sprint 2](./SPRINT_2_EDUCATOR_CRUD.md)** | 3 days | Educator CRUD | Course & lesson management, video embeds, drag-and-drop |
| **[Sprint 3](./SPRINT_3_LEARNER_EXPERIENCE.md)** | 2 days | Learner Experience | Course browsing, enrollment, progress tracking |
| **[Sprint 4](./SPRINT_4_AI_QUIZ_GENERATOR.md)** | 2.5 days | AI Quiz Generator | Transcript extraction, Groq integration, quiz UI |
| **[Sprint 5](./SPRINT_5_TESTING_POLISH.md)** | 2 days | Testing & Polish | Unit tests, E2E tests, accessibility, responsive design |
| **[Sprint 6](./SPRINT_6_DEPLOYMENT_DOCS.md)** | 1 day | Deployment & Docs | Vercel deploy, CI/CD, README, final QA |

**Total Estimated Time:** 12.5 days (full-time) or 3-4 weeks (part-time)

---

## 🎯 Sprint Breakdown

### Sprint 1 — Foundation & Authentication
**Goal:** Set up the project infrastructure and authentication system

**Phases:**
1. Project Scaffold (4h) — Next.js, TypeScript, Tailwind, shadcn/ui
2. Database Setup (3h) — Prisma, Supabase, migrations
3. Zod Validation Schemas (2h) — Input validation for all entities
4. NextAuth.js Setup (4h) — Credentials provider, JWT sessions
5. Auth UI Pages (3h) — Register and login forms
6. Testing & Verification (2h) — Manual testing of auth flow

**Key Files:**
- `lib/db.ts`, `lib/auth.ts`, `middleware.ts`
- `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
- `prisma/schema.prisma`

---

### Sprint 2 — Educator CRUD
**Goal:** Build complete course and lesson management for educators

**Phases:**
1. Educator Dashboard Layout (3h) — Navigation, sidebar, navbar
2. Course CRUD — Server Actions (4h) — Create, update, delete courses
3. Course UI Components (4h) — Forms, cards, validation
4. Lesson CRUD — Server Actions (4h) — Create, update, delete lessons
5. Lesson UI Components (5h) — Forms, video embed, drag-and-drop
6. Testing & Verification (3h) — Manual testing of all CRUD operations

**Key Files:**
- `actions/course.actions.ts`, `actions/lesson.actions.ts`
- `components/course/CourseForm.tsx`, `components/course/LessonList.tsx`
- `lib/embed.ts`

---

### Sprint 3 — Learner Experience
**Goal:** Build course browsing, enrollment, and progress tracking

**Phases:**
1. Public Course Listing (4h) — SSR, ISR, filtering
2. Course Detail & Enrollment (3h) — Enroll button, access control
3. Lesson Viewer & Progress (4h) — Video player, mark complete
4. Learner Dashboard (3h) — Progress bars, statistics
5. Testing & Verification (2h) — Manual testing of learner flow

**Key Files:**
- `app/courses/page.tsx`, `app/courses/[courseId]/page.tsx`
- `actions/enrollment.actions.ts`, `actions/progress.actions.ts`
- `components/shared/ProgressBar.tsx`

---

### Sprint 4 — AI Quiz Generator
**Goal:** Implement AI-powered quiz generation using Groq

**Phases:**
1. YouTube Transcript Extraction (4h) — Fetch, clean, truncate
2. Groq Integration (3h) — API client, prompt engineering
3. Quiz Generation Server Action (3h) — Transcript → Groq → DB
4. Quiz UI Components (4h) — Editor for educators, player for learners
5. Testing & Verification (3h) — Manual testing of AI flow

**Key Files:**
- `lib/transcript.ts`, `lib/groq.ts`
- `actions/quiz.actions.ts`
- `components/quiz/QuizEditor.tsx`, `components/quiz/QuizPlayer.tsx`

---

### Sprint 5 — Testing & Polish
**Goal:** Comprehensive testing, accessibility, and UI polish

**Phases:**
1. Unit Testing Setup (3h) — Vitest, test utilities
2. E2E Testing Setup (4h) — Playwright, auth/CRUD/quiz tests
3. UI Polish & Responsive Design (4h) — Mobile, loading states, empty states
4. Accessibility Audit (3h) — ARIA labels, keyboard nav, screen reader
5. Error Handling & Edge Cases (3h) — Error boundaries, 404/500 pages
6. Performance Optimization (2h) — Image optimization, ISR, bundle size

**Key Files:**
- `vitest.config.ts`, `playwright.config.ts`
- `tests/unit/*.test.ts`, `tests/e2e/*.spec.ts`
- `app/error.tsx`, `app/not-found.tsx`

---

### Sprint 6 — Deployment & Documentation
**Goal:** Deploy to production and write comprehensive documentation

**Phases:**
1. Vercel Deployment (2h) — Environment variables, production DB
2. GitHub Actions CI/CD (2h) — Automated testing and deployment
3. Database Seed Script (1h) — Demo data for testing
4. Comprehensive README (2h) — Setup, architecture, decisions
5. Footer & Final Touches (1h) — Links, favicon, meta tags
6. Final QA & Submission (1h) — End-to-end testing, submission

**Key Files:**
- `.github/workflows/ci.yml`
- `prisma/seed.ts`
- `README.md`, `docs/ARCHITECTURE.md`
- `components/layout/Footer.tsx`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Supabase account)
- Groq API key (free tier: https://console.groq.com)
- Git and GitHub account
- Vercel account (for deployment)

### Recommended Workflow

1. **Read the Project Plan** — Review `LearnFlow_Project_Plan.md` for context
2. **Start with Sprint 1** — Follow each phase sequentially
3. **Commit Frequently** — Commit after each phase completion
4. **Test as You Go** — Don't wait until Sprint 5 to test
5. **Document Decisions** — Keep notes on why you made certain choices
6. **Ask for Help** — If stuck, review the implementation notes in each sprint

### Daily Schedule (Full-Time)

**Week 1:**
- Day 1-2: Sprint 1 (Foundation)
- Day 3-5: Sprint 2 (Educator CRUD)

**Week 2:**
- Day 6-7: Sprint 3 (Learner Experience)
- Day 8-10: Sprint 4 (AI Quiz Generator)

**Week 3:**
- Day 11-12: Sprint 5 (Testing & Polish)
- Day 13: Sprint 6 (Deployment & Docs)
- Day 14: Buffer for fixes and final QA

### Part-Time Schedule

**Week 1-2:** Sprint 1 & 2 (evenings/weekends)  
**Week 3:** Sprint 3 & 4  
**Week 4:** Sprint 5 & 6

---

## 📊 Progress Tracking

Use this checklist to track your progress:

### Sprint 1: Foundation ✅
- [ ] Project scaffolded
- [ ] Database setup complete
- [ ] Auth working (register/login)
- [ ] Middleware protecting routes

### Sprint 2: Educator CRUD ✅
- [ ] Course CRUD functional
- [ ] Lesson CRUD functional
- [ ] Video embeds working
- [ ] Drag-and-drop reordering

### Sprint 3: Learner Experience ✅
- [ ] Course listing with filters
- [ ] Enrollment working
- [ ] Lesson viewer functional
- [ ] Progress tracking working

### Sprint 4: AI Quiz Generator ✅
- [ ] Transcript extraction working
- [ ] Groq integration functional
- [ ] Quiz editor for educators
- [ ] Quiz player for learners

### Sprint 5: Testing & Polish ✅
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] Mobile responsive
- [ ] Accessibility compliant

### Sprint 6: Deployment ✅
- [ ] Deployed to Vercel
- [ ] CI/CD pipeline working
- [ ] README complete
- [ ] Assignment submitted

---

## 🎓 Learning Outcomes

By completing this roadmap, you will have:

✅ Built a production-ready Next.js 16 application  
✅ Implemented secure authentication with NextAuth.js  
✅ Designed and implemented a relational database with Prisma  
✅ Integrated AI (Groq) with real-world considerations  
✅ Written comprehensive tests (unit + E2E)  
✅ Deployed to production with CI/CD  
✅ Documented architecture and design decisions  

---

## 💡 Tips for Success

### Do This:
- ✅ Follow the sprints in order — they build on each other
- ✅ Read the implementation notes carefully
- ✅ Test each feature before moving to the next
- ✅ Commit code frequently with clear messages
- ✅ Deploy early (after Sprint 2) to catch issues
- ✅ Take breaks — coding for 12 days straight is exhausting

### Don't Do This:
- ❌ Skip Sprint 1 — foundation is critical
- ❌ Over-engineer — stick to the scope
- ❌ Add features not in the plan — finish first, then enhance
- ❌ Skip testing — you'll regret it during final QA
- ❌ Wait until Day 12 to deploy — deploy early and often

---

## 🆘 Troubleshooting

### Common Issues

**Issue:** Prisma Client not found  
**Solution:** Run `npx prisma generate` after schema changes

**Issue:** NextAuth session not persisting  
**Solution:** Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in `.env.local`

**Issue:** Groq API rate limit  
**Solution:** Free tier allows 30 req/min — add basic rate limiting

**Issue:** YouTube transcript fails  
**Solution:** Ensure video has captions enabled, implement fallback to lesson body

**Issue:** Vercel deployment fails  
**Solution:** Check environment variables are set in Vercel dashboard

---

## 📚 Additional Resources

### Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Groq API Docs](https://console.groq.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

### Tutorials
- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [NextAuth.js Tutorial](https://next-auth.js.org/getting-started/example)

---

## 🎉 Final Notes

This roadmap is designed to be **comprehensive yet achievable**. Each sprint is scoped to be completed in the estimated time by a developer with intermediate Next.js experience.

**Remember:**
- Quality over speed — a polished, working app is better than a rushed, buggy one
- Document as you go — future you will thank present you
- Test thoroughly — the assignment will be evaluated on functionality
- Have fun — you're building something real and impressive!

**Good luck! You've got this! 🚀**

---

## 📞 Questions?

If you get stuck or have questions about the roadmap:
1. Review the implementation notes in the relevant sprint document
2. Check the troubleshooting section above
3. Consult the official documentation for the technology
4. Search for similar issues on Stack Overflow or GitHub

---

**Built for House of Edtech — Fullstack Developer Assignment**  
**Author:** Your Name  
**Date:** January 2026
