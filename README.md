# LearnFlow — AI-Powered Learning Management System

<div align="center">
  <br />
  <a href="https://learnflow-neon.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live-Demo-6366f1?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://github.com/PranjalBarnwal/learnflow" target="_blank">
    <img src="https://img.shields.io/badge/Source-Code-181717?style=for-the-badge&logo=github&logoColor=white" alt="Source Code" />
  </a>
  <br />
  <br />
</div>

A modern, full-stack Learning Management System (LMS) built for the **House of Edtech Fullstack Developer Assignment**. This platform enables educators to create and manage courses with AI-powered quiz generation, while learners can enroll, track progress, and test their knowledge.

> **Live Demo:** [https://learnflow-neon.vercel.app/](https://learnflow-neon.vercel.app/)
> **GitHub Repository:** [https://github.com/PranjalBarnwal/learnflow](https://github.com/PranjalBarnwal/learnflow)

---

## 🚀 Features

### For Educators
| Feature | Description |
|---------|-------------|
| **Course Management** | Full CRUD — create, edit, publish, and delete courses |
| **Lesson Builder** | Rich text editor with video embedding (YouTube, Loom) via embed URL parsing |
| **AI Quiz Generator** | Enter a **topic** and choose **difficulty** (Easy/Medium/Hard) — AI generates 5 multiple-choice questions. No transcript dependency. |
| **Quiz Editor** | Review, edit, add/remove questions, and change correct answers before saving |
| **Drag & Drop** | Reorder lessons with intuitive drag-and-drop using @dnd-kit |
| **Analytics** | Dashboard with total courses, students, and lessons at a glance |

### For Learners
| Feature | Description |
|---------|-------------|
| **Course Discovery** | Browse published courses with filters by category, difficulty, and search |
| **Enrollment** | One-click enroll into any published course |
| **Progress Tracking** | Visual progress bars for each enrolled course |
| **Interactive Quizzes** | Take AI-generated quizzes with instant scoring |
| **Quiz History** | View past attempts, detailed per-question breakdown, and attempt summaries |
| **Personal Dashboard** | Stats — enrolled courses, lessons completed, overall progress percentage |

### Technical Highlights
- **Performance Optimized**: 11 database indexes, N+1 query elimination, pagination, ISR
- **AI Integration**: Groq API (Llama 3.3 70B) for on-demand quiz generation from topic prompts
- **Type-Safe**: Full TypeScript coverage with Prisma ORM and Zod validation
- **Modern UI**: Tailwind CSS with shadcn/ui components — clean, responsive, accessible
- **Authentication**: NextAuth.js v5 with role-based access control (Educator / Learner)
- **Server Actions**: All mutations via Next.js Server Actions for instant, type-safe updates

---

## 🧠 AI Quiz Generation (Updated)

The original transcript-based quiz generation has been **replaced** with a more reliable **topic-based approach**:

1. **Educator enters a topic** (e.g., "JavaScript Promises", "Photosynthesis", "World War II")
2. **Selects difficulty level** — Easy (fundamentals), Medium (applied knowledge), or Hard (critical thinking)
3. **AI generates 5 multiple-choice questions** via Groq's Llama 3.3 70B model
4. **Educator reviews, edits, and saves** — the quiz editor supports modifying questions, options, and correct answers

**Before (removed):** Analyzed YouTube video transcripts → unreliable on serverless (Vercel) due to YouTube blocking server IP ranges

**Now:** Prompt-based generation → works consistently on any deployment. No video URL needed.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js v5 |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui + Radix UI |
| **AI** | Groq API (Llama 3.3 70B) |
| **Validation** | Zod |
| **Drag & Drop** | @dnd-kit |

---

## 📁 Project Structure

```
learnflow/
├── actions/              # Server Actions (auth, course, lesson, quiz, enrollment, progress)
├── app/                  # Next.js App Router
│   ├── (auth)/          # Login & Register pages
│   ├── (dashboard)/     # Protected educator & learner dashboards
│   ├── api/auth/        # NextAuth API route
│   └── courses/         # Public course browsing (with pagination & filters)
├── components/          # React components
│   ├── course/          # CourseCard, CourseForm, LessonForm, filters, grids
│   ├── layout/          # Navbar, Sidebar, Footer (with GitHub & LinkedIn)
│   ├── lesson/          # Lesson navigation, mark-complete button
│   ├── quiz/            # QuizEditor, QuizPlayer, QuizResults, history modals
│   ├── shared/          # ProgressBar
│   └── ui/              # shadcn/ui components (button, card, dialog, select, etc.)
├── lib/                 # Utilities
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma client (optimized adapter-pg)
│   ├── groq.ts          # AI integration — quiz generation from topic + difficulty
│   ├── embed.ts         # Video URL parsing (YouTube / Loom)
│   └── validations/     # Zod schemas for all inputs
├── prisma/
│   └── schema.prisma    # Database schema with 11 performance indexes
├── scripts/             # Seed scripts for test data
└── roadmap/             # Sprint documentation
```

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Setup

```bash
# Clone the repository
git clone https://github.com/PranjalBarnwal/learnflow.git
cd learnflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, NEXTAUTH_SECRET, GROQ_API_KEY

# Set up the database
npx prisma generate
npx prisma migrate dev --name init

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `GROQ_API_KEY` | Groq AI API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

---

## 🎯 Usage

### As an Educator
1. **Register** at `/register` with role **Educator**
2. **Create a course** at `/educator/courses/new` — set title, description, category, difficulty
3. **Add lessons** — rich text body + optional video URL (YouTube/Loom auto-embedded)
4. **Generate quizzes** — enter a **topic** (e.g., "Photosynthesis"), choose **difficulty**, AI creates 5 questions
5. **Review & edit** questions before saving
6. **Publish** the course to make it visible to learners

### As a Learner
1. **Register** at `/register` with role **Learner**
2. **Browse courses** at `/courses` — filter by category, difficulty, or search
3. **Enroll** in any published course
4. **Take lessons** — read content, watch embedded videos
5. **Complete quizzes** — get instant scores with detailed results
6. **Track progress** on your dashboard at `/learner`

---

## ⚡ Scalability & Performance

LearnFlow was designed with production scalability in mind. Here are the key optimizations implemented:

### 📊 Database Indexes (11 Indexes)
Strategic indexes on frequently queried columns and composite indexes for complex filters:

```prisma
// Course indexes
@@index([published])                    // Filter published courses
@@index([category])                     // Category-based browsing
@@index([difficulty])                   // Difficulty-based filters
@@index([educatorId])                   // Educator's course list
@@index([published, category, difficulty])  // Composite filter
@@index([createdAt])                    // Sort by date

// Lesson indexes
@@index([courseId])                     // Lessons by course
@@index([courseId, orderIndex])         // Ordered lesson retrieval

// Enrollment indexes
@@unique([userId, courseId])            // Unique constraint
@@index([userId], [courseId], [enrolledAt])

// Progress indexes
@@unique([userId, lessonId])            // Unique constraint
@@index([userId], [lessonId])

// Quiz indexes
@@index([lessonId])
@@index([quizId], [userId], [attemptedAt])
```

These indexes make queries **5-100x faster** on large datasets compared to unindexed queries.

### 📄 Pagination (3 Levels)
Pagination is implemented consistently across the application to handle large datasets:

| Page | Items Per Page | Details |
|------|---------------|---------|
| Public course listing (`/courses`) | **12** per page | Filters preserved across pages |
| Educator dashboard courses | **20** per page | Syncs with dashboard stats |
| Learner enrolled courses | **10** per page | Progress data included |

Uses the standard `skip`/`take` pattern with total count via `count()`.

### 🔄 N+1 Query Elimination
The learner dashboard originally made N+1 queries (one for enrollment + one per course for progress). This has been **optimized to 2 queries total**:

```
Before: 1 enrollment query + N separate progress queries
After:  1 enrollment query + 1 batch progress query (WHERE lessonId IN [...])
```

### ⚡ ISR (Incremental Static Regeneration)
The public courses page (`/courses`) uses ISR with a **60-second revalidation** interval:

```tsx
export const revalidate = 60; // ISR: revalidate every 60 seconds
```

This means:
- First visitor gets a static page served instantly
- Background revalidation happens every 60 seconds
- No server load on subsequent visits
- Fresh data without full rebuilds

### 🔐 Security
- **Password Hashing**: bcrypt with cost factor 12
- **Input Validation**: Zod schemas on all Server Action inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Role-Based Access**: Server-side checks in every action (educator vs learner)
- **Ownership Verification**: Every mutation verifies the user owns the resource

---

## 🔌 API Architecture

All mutations are handled via **Next.js Server Actions** (`'use server'`), eliminating the need for REST endpoints:

| Action File | Key Operations |
|-------------|----------------|
| `actions/auth.actions.ts` | Register user |
| `actions/course.actions.ts` | Create, update, delete courses; toggle publish; get courses (paginated) |
| `actions/lesson.actions.ts` | Create, update, delete lessons; reorder via drag-and-drop |
| `actions/quiz.actions.ts` | Generate quiz from topic+prompt, save, submit attempt, get history |
| `actions/enrollment.actions.ts` | Enroll in course |
| `actions/progress.actions.ts` | Mark lesson complete |

---

## 🧪 Test Data

```bash
# Seed 1000 test courses for performance testing
node scripts/seed-courses.js

# Clear all data
node scripts/clear-database.js
```

---

## 📊 Database Schema

```prisma
model User { ... }     // Educators & Learners with role (ADMIN | EDUCATOR | LEARNER)
model Course { ... }   // Courses with category, difficulty, published status
model Lesson { ... }   // Lessons with body, video URL, ordered by orderIndex
model Enrollment { ... }  // Many-to-many: User <-> Course with unique constraint
model Progress { ... }  // Tracks completed lessons per user
model Quiz { ... }      // Links to a lesson, has many questions
model Question { ... }  // Multiple-choice: text, 4 options, correctIndex
model QuizAttempt { ... }  // User submissions: score, answers array
```

---

## 🐛 Troubleshooting

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma Client
npx prisma generate

# Rebuild
npm run build
```

---

## 📄 License

This project is part of the **House of Edtech Fullstack Developer Assignment**.

---

## 👤 Author

**Pranjal Barnwal**

[![GitHub](https://img.shields.io/badge/GitHub-PranjalBarnwal-181717?style=flat-square&logo=github)](https://github.com/PranjalBarnwal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Pranjal%20Barnwal-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/pranjal-barnwal-dev/)

---

> **Built with ❤️ using Next.js 16, TypeScript, AI, and Tailwind CSS**
>
> *"A good programmer is someone who always looks both ways before crossing a one-way street." — Doug Linder*
