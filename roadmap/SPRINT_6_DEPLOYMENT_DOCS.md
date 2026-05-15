# Sprint 6 — Deployment & Documentation

**Duration:** 1 day  
**Goal:** Deploy to production, write comprehensive documentation, and final QA

---

## Phase 1: Vercel Deployment (2 hours)

### Tasks
- [ ] Create Vercel account and link GitHub repo
- [ ] Configure environment variables in Vercel
- [ ] Set up Supabase production database
- [ ] Run production migrations
- [ ] Deploy to Vercel
- [ ] Test production deployment
- [ ] Set up custom domain (optional)

### Acceptance Criteria
- ✅ App deployed and accessible via Vercel URL
- ✅ All environment variables configured
- ✅ Database migrations run successfully
- ✅ Production app works without errors
- ✅ HTTPS enabled by default

### Implementation Steps

**1. Create Vercel Project:**
```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Or use Vercel Dashboard:**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings

**2. Configure Environment Variables:**

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-new-secret-for-production"

# Groq
GROQ_API_KEY="your-groq-api-key"

# Node Environment
NODE_ENV="production"
```

**Generate new NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**3. Set up Supabase Production Database:**

1. Go to https://supabase.com
2. Create new project (or use existing)
3. Copy connection string from Settings → Database
4. Add to Vercel environment variables

**4. Run Production Migrations:**

```bash
# Set DATABASE_URL to production
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

**5. Deploy:**

Push to `main` branch → Vercel auto-deploys

Or manually:
```bash
vercel --prod
```

**6. Verify Deployment:**

- [ ] Visit production URL
- [ ] Test registration and login
- [ ] Test course creation
- [ ] Test enrollment
- [ ] Test quiz generation
- [ ] Check all images load
- [ ] Test on mobile device

---

## Phase 2: GitHub Actions CI/CD (2 hours)

### Tasks
- [ ] Create GitHub Actions workflow
- [ ] Configure test database for CI
- [ ] Add type checking step
- [ ] Add linting step
- [ ] Add unit tests step
- [ ] Add build verification step
- [ ] Set up automatic deployment on merge to main

### Acceptance Criteria
- ✅ CI runs on every pull request
- ✅ All checks must pass before merge
- ✅ Automatic deployment to Vercel on merge
- ✅ Build failures prevent deployment

### Files Created
```
.github/
└── workflows/
    └── ci.yml
```

### Implementation Notes

**.github/workflows/ci.yml:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
        run: |
          npx prisma migrate deploy
          npx prisma generate

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Run unit tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          NEXTAUTH_SECRET: test-secret
          NEXTAUTH_URL: http://localhost:3000
        run: npm run test

      - name: Build
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          NEXTAUTH_SECRET: test-secret
          NEXTAUTH_URL: http://localhost:3000
          GROQ_API_KEY: test-key
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Setup Vercel Secrets:**

1. Get Vercel token: https://vercel.com/account/tokens
2. Get Org ID and Project ID from Vercel project settings
3. Add to GitHub Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

---

## Phase 3: Database Seed Script (1 hour)

### Tasks
- [ ] Create `prisma/seed.ts`
- [ ] Add demo educator account
- [ ] Add demo learner account
- [ ] Add 2-3 sample courses with lessons
- [ ] Add sample quiz
- [ ] Configure seed script in package.json

### Acceptance Criteria
- ✅ Seed script runs successfully
- ✅ Demo accounts have known credentials
- ✅ Sample courses are published
- ✅ Sample lessons have video URLs
- ✅ Can run seed multiple times (idempotent)

### Files Created
```
prisma/
└── seed.ts
```

### Implementation Notes

**prisma/seed.ts:**
```typescript
import { PrismaClient, Role, Difficulty } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create educator
  const educator = await prisma.user.upsert({
    where: { email: 'educator@learnflow.com' },
    update: {},
    create: {
      name: 'Demo Educator',
      email: 'educator@learnflow.com',
      passwordHash: await hash('password123', 12),
      role: Role.EDUCATOR,
    },
  });

  console.log('✅ Created educator:', educator.email);

  // Create learner
  const learner = await prisma.user.upsert({
    where: { email: 'learner@learnflow.com' },
    update: {},
    create: {
      name: 'Demo Learner',
      email: 'learner@learnflow.com',
      passwordHash: await hash('password123', 12),
      role: Role.LEARNER,
    },
  });

  console.log('✅ Created learner:', learner.email);

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { id: 'seed-course-1' },
    update: {},
    create: {
      id: 'seed-course-1',
      title: 'Introduction to Web Development',
      description:
        'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      category: 'Programming',
      difficulty: Difficulty.BEGINNER,
      published: true,
      educatorId: educator.id,
    },
  });

  console.log('✅ Created course:', course1.title);

  // Create lessons for course 1
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'HTML Basics',
      body: `# HTML Basics

HTML (HyperText Markup Language) is the standard markup language for creating web pages.

## Key Concepts
- Elements and tags
- Attributes
- Document structure
- Semantic HTML`,
      videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      orderIndex: 0,
      courseId: course1.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'CSS Fundamentals',
      body: `# CSS Fundamentals

CSS (Cascading Style Sheets) is used to style HTML elements.

## Topics Covered
- Selectors
- Box model
- Flexbox
- Grid layout`,
      videoUrl: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
      orderIndex: 1,
      courseId: course1.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'JavaScript Introduction',
      body: `# JavaScript Introduction

JavaScript is the programming language of the web.

## What You'll Learn
- Variables and data types
- Functions
- DOM manipulation
- Events`,
      videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      orderIndex: 2,
      courseId: course1.id,
    },
  });

  console.log('✅ Created lessons for course 1');

  // Create sample quiz
  const quiz = await prisma.quiz.create({
    data: {
      lessonId: lesson1.id,
      questions: {
        create: [
          {
            text: 'What does HTML stand for?',
            options: [
              'HyperText Markup Language',
              'High Tech Modern Language',
              'Home Tool Markup Language',
              'Hyperlinks and Text Markup Language',
            ],
            correctIndex: 0,
          },
          {
            text: 'Which tag is used for the largest heading?',
            options: ['<heading>', '<h6>', '<h1>', '<head>'],
            correctIndex: 2,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample quiz');

  // Create second course
  const course2 = await prisma.course.create({
    data: {
      title: 'React for Beginners',
      description:
        'Master React fundamentals and build modern web applications.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
      category: 'Programming',
      difficulty: Difficulty.INTERMEDIATE,
      published: true,
      educatorId: educator.id,
    },
  });

  console.log('✅ Created course:', course2.title);

  // Enroll learner in course 1
  await prisma.enrollment.create({
    data: {
      userId: learner.id,
      courseId: course1.id,
    },
  });

  console.log('✅ Enrolled learner in course 1');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Update package.json:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed"
  }
}
```

**Install tsx:**
```bash
npm install -D tsx
```

**Run seed:**
```bash
npm run db:seed
```

---

## Phase 4: Comprehensive README (2 hours)

### Tasks
- [ ] Write project overview
- [ ] Add setup instructions
- [ ] Document environment variables
- [ ] Add architecture decisions
- [ ] Document API routes
- [ ] Add screenshots
- [ ] Document known limitations
- [ ] Add production considerations

### Acceptance Criteria
- ✅ README is comprehensive and clear
- ✅ Setup instructions are step-by-step
- ✅ All environment variables documented
- ✅ Architecture decisions explained
- ✅ Screenshots show key features
- ✅ Known limitations listed

### Files Created
```
README.md
docs/
├── ARCHITECTURE.md
├── API.md
└── DEPLOYMENT.md
```

### Implementation Notes

**README.md structure:**
```markdown
# LearnFlow — AI-Assisted Course Management Platform

> Full-stack course management platform with AI-powered quiz generation

[Live Demo](https://learnflow.vercel.app) | [Video Walkthrough](link)

## Features

- 🎓 Role-based access (Educator, Learner)
- 📚 Course and lesson management
- 🎥 Video embed support (YouTube, Loom)
- 🤖 AI-powered quiz generation via Groq
- 📊 Progress tracking
- 🔒 Secure authentication with NextAuth.js

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** PostgreSQL (Supabase), Prisma ORM
- **Auth:** NextAuth.js v5
- **AI:** Groq (llama-3.3-70b)
- **Deployment:** Vercel

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Supabase account)
- Groq API key (free tier)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/learnflow.git
cd learnflow
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GROQ_API_KEY="your-groq-api-key"
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Seed the database (optional)
```bash
npm run db:seed
```

6. Start development server
```bash
npm run dev
```

Visit http://localhost:3000

### Demo Accounts

After seeding:
- **Educator:** educator@learnflow.com / password123
- **Learner:** learner@learnflow.com / password123

## Architecture

### Key Design Decisions

**1. Transcript-Based Quiz Generation**

Instead of relying on educator-written content, we extract YouTube transcripts directly. This provides rich, structured content for AI quiz generation.

**2. Truncation vs. Summarization**

For this implementation, we truncate transcripts to ~3000 tokens. Production path: chunk → summarize → generate pipeline (documented in code).

**3. Server-Side AI Calls**

All Groq API calls happen server-side only. API keys never exposed to client.

**4. Video Embed Strategy**

We don't host videos. Educators paste YouTube/Loom URLs, we extract IDs server-side and render sandboxed iframes.

### Security

- Passwords hashed with bcrypt (cost 12)
- JWT sessions with httpOnly cookies
- Middleware-level route protection
- Server-side role validation on all actions
- Prisma parameterized queries (no SQL injection)
- CSP headers configured

### Scalability

- Stateless JWT sessions (horizontal scaling ready)
- ISR for public pages (reduced DB load)
- Prisma select projections (no over-fetching)
- Async AI calls (non-blocking)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

Quick deploy to Vercel:
```bash
vercel
```

## Known Limitations

1. **Transcript Extraction:** Uses unofficial YouTube API (may break)
2. **Video Hosting:** No DRM or signed URLs (production path: Mux/Vdocipher)
3. **Rate Limiting:** No Redis-based rate limiting (production path: Upstash)
4. **Admin Panel:** Not implemented (educator self-service only)

## Production Considerations

### Video DRM
Migrate to Mux or Vdocipher for:
- Signed URLs
- DRM protection
- Analytics

### Rate Limiting
Add Upstash Redis for:
- AI endpoint rate limiting
- API abuse prevention

### Caching
Add Redis for:
- Query-level caching
- Session storage

### Monitoring
Add Sentry for:
- Error tracking
- Performance monitoring

## License

MIT

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

---

Built for House of Edtech — Fullstack Developer Assignment
```

---

## Phase 5: Footer & Final Touches (1 hour)

### Tasks
- [ ] Add footer component with name, GitHub, LinkedIn
- [ ] Add favicon
- [ ] Add Open Graph meta tags
- [ ] Test all links
- [ ] Final UI polish
- [ ] Take screenshots for README

### Acceptance Criteria
- ✅ Footer shows on all pages
- ✅ Footer has working links to GitHub and LinkedIn
- ✅ Favicon displays correctly
- ✅ Social sharing shows correct preview
- ✅ All external links open in new tab

### Implementation Notes

**components/layout/Footer.tsx:**
```typescript
import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold">LearnFlow</p>
            <p className="text-sm text-gray-600">
              Built by Your Name for House of Edtech
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github size={20} />
              <span>GitHub</span>
            </Link>

            <Link
              href="https://linkedin.com/in/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          © {new Date().getFullYear()} LearnFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

**Add to layout:**
```typescript
// app/layout.tsx
import { Footer } from '@/components/layout/Footer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body className="flex flex-col min-h-screen">
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

**Add Open Graph meta tags:**
```typescript
// app/layout.tsx
export const metadata = {
  title: 'LearnFlow — AI-Assisted Course Management',
  description: 'Full-stack course management platform with AI-powered quiz generation',
  openGraph: {
    title: 'LearnFlow',
    description: 'AI-Assisted Course Management Platform',
    url: 'https://learnflow.vercel.app',
    siteName: 'LearnFlow',
    images: [
      {
        url: 'https://learnflow.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnFlow',
    description: 'AI-Assisted Course Management Platform',
    images: ['https://learnflow.vercel.app/og-image.png'],
  },
};
```

**Add favicon:**
Place `favicon.ico` in `app/` directory

---

## Phase 6: Final QA & Submission (1 hour)

### Tasks
- [ ] Test entire flow as educator
- [ ] Test entire flow as learner
- [ ] Test on mobile device
- [ ] Check all links work
- [ ] Verify environment variables documented
- [ ] Check GitHub repo is public
- [ ] Verify CI/CD pipeline passes
- [ ] Take demo video (optional)
- [ ] Submit assignment

### Final Checklist

**Functionality:**
- [ ] Register as educator and learner
- [ ] Create course with lessons
- [ ] Add video URLs (YouTube and Loom)
- [ ] Generate quiz from lesson
- [ ] Edit and save quiz
- [ ] Enroll in course as learner
- [ ] View lessons and mark complete
- [ ] Attempt quiz and see score
- [ ] Check progress on dashboard

**Code Quality:**
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All tests passing
- [ ] Code is well-commented
- [ ] Consistent formatting

**Documentation:**
- [ ] README is comprehensive
- [ ] Setup instructions are clear
- [ ] Environment variables documented
- [ ] Architecture decisions explained
- [ ] Known limitations listed

**Deployment:**
- [ ] Live URL accessible
- [ ] All features work in production
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast load times

**Submission:**
- [ ] GitHub repo is public
- [ ] README has live demo link
- [ ] Footer has name, GitHub, LinkedIn
- [ ] CI/CD pipeline passing
- [ ] Seed data available

---

## Sprint 6 Completion Checklist

- [ ] Deployed to Vercel successfully
- [ ] GitHub Actions CI/CD configured
- [ ] Database seed script created
- [ ] Comprehensive README written
- [ ] Footer with links added
- [ ] Favicon and meta tags added
- [ ] Final QA completed
- [ ] Assignment submitted

---

## Submission Package

**What to Submit:**
1. GitHub repository URL (public)
2. Live deployment URL (Vercel)
3. Demo video (optional but recommended)

**GitHub Repository Should Include:**
- Complete source code
- README with setup instructions
- .env.example with all variables
- Seed script for demo data
- CI/CD pipeline configuration

**Live Deployment Should Have:**
- Working authentication
- Sample courses (from seed)
- All features functional
- Mobile responsive
- Fast performance

---

🎉 **Congratulations! You've completed LearnFlow!**

This is a production-ready, well-architected full-stack application that demonstrates:
- Modern Next.js 16 patterns
- Secure authentication and authorization
- AI integration with real-world considerations
- Clean code and comprehensive testing
- Professional documentation

**You're ready to submit!** 🚀
