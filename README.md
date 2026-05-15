# LearnFlow - AI-Powered Learning Management System

A modern, full-stack Learning Management System (LMS) built with Next.js 16, featuring AI-powered quiz generation, video transcript analysis, and comprehensive course management.

## 🚀 Features

### For Educators
- **Course Management**: Create, edit, and publish courses
- **Lesson Builder**: Rich text editor with video embedding (YouTube, Loom)
- **AI Quiz Generator**: Automatically generate quizzes from video transcripts or lesson content
- **Drag & Drop**: Reorder lessons with intuitive drag-and-drop
- **Analytics**: Track student enrollments and progress

### For Learners
- **Course Discovery**: Browse and filter courses by category and difficulty
- **Progress Tracking**: Track completion across all enrolled courses
- **Interactive Quizzes**: Test knowledge with AI-generated quizzes
- **Video Learning**: Embedded video player with transcript support
- **Dashboard**: Personalized learning dashboard with statistics

### Technical Highlights
- **Performance Optimized**: Database indexes, N+1 query elimination, pagination
- **AI Integration**: Groq API for quiz generation and transcript analysis
- **Type-Safe**: Full TypeScript coverage with Prisma ORM
- **Modern UI**: Tailwind CSS with shadcn/ui components
- **Authentication**: NextAuth.js with role-based access control
- **Real-time**: Server Actions for instant updates

---

## 📋 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **AI**: Groq API (Llama 3.3 70B)
- **Validation**: Zod
- **Drag & Drop**: @dnd-kit

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Supabase account)
- Groq API key (for AI features)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd learnflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Groq AI
GROQ_API_KEY="your-groq-api-key"

# Node Environment
NODE_ENV="development"
```

4. **Set up database**
```bash
# Generate Prisma Client
npx prisma generate

# Apply performance indexes
node scripts/apply-indexes.js
```

5. **Seed test data (optional)**
```bash
# Create 1000 test courses
node scripts/seed-courses-fast.js
```

6. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
learnflow/
├── actions/              # Server Actions
│   ├── auth.actions.ts
│   ├── course.actions.ts
│   ├── enrollment.actions.ts
│   ├── lesson.actions.ts
│   ├── progress.actions.ts
│   └── quiz.actions.ts
├── app/                  # Next.js App Router
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── api/             # API routes
│   └── courses/         # Public course pages
├── components/          # React components
│   ├── course/
│   ├── layout/
│   ├── lesson/
│   ├── quiz/
│   ├── shared/
│   └── ui/              # shadcn/ui components
├── lib/                 # Utilities
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma client
│   ├── groq.ts          # AI integration
│   ├── transcript.ts    # Video transcript extraction
│   └── validations/     # Zod schemas
├── prisma/
│   └── schema.prisma    # Database schema
├── scripts/             # Utility scripts
│   ├── apply-indexes.js
│   ├── clear-database.js
│   └── seed-courses-fast.js
└── types/               # TypeScript types
```

---

## 🎯 Usage

### As an Educator

1. **Register** at `/register` with role "Educator"
2. **Create a course** at `/educator/courses/new`
3. **Add lessons** with video URLs and content
4. **Generate quizzes** using AI from video transcripts
5. **Publish** your course to make it visible to learners

### As a Learner

1. **Register** at `/register` with role "Learner"
2. **Browse courses** at `/courses`
3. **Enroll** in courses you're interested in
4. **Track progress** on your dashboard at `/learner`
5. **Complete lessons** and take quizzes

---

## 🔧 Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma studio                    # Open Prisma Studio
npx prisma generate                  # Generate Prisma Client
node scripts/apply-indexes.js        # Apply performance indexes
node scripts/clear-database.js       # Clear all data
node scripts/seed-courses-fast.js    # Seed test data
```

---

## 🚀 Performance Optimizations

### Database Indexes
- 11 strategic indexes on frequently queried fields
- 5-100x faster queries on large datasets
- Composite indexes for complex filters

### Query Optimization
- Eliminated N+1 queries in learner dashboard
- Batch queries instead of sequential
- 2 queries instead of 2*N for enrolled courses

### Pagination
- 12 items per page on course listings
- Prevents memory issues with large datasets
- Cursor-based pagination support

### Caching (Planned)
- Next.js ISR for course listings (60s revalidation)
- Redis caching for user sessions
- Query result caching

---

## 🧪 Testing

### Test Credentials (after seeding)
```
Educators:
  Email: educator1@test.com to educator10@test.com
  Password: password123

Learners:
  Email: learner1@test.com to learner100@test.com
  Password: password123
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Course CRUD operations
- [ ] Lesson creation with video embedding
- [ ] AI quiz generation
- [ ] Enrollment flow
- [ ] Progress tracking
- [ ] Pagination performance
- [ ] Role-based access control

---

## 📊 Database Schema

### Core Models
- **User**: Educators and learners with role-based access
- **Course**: Course metadata with educator relationship
- **Lesson**: Lesson content with video URLs and ordering
- **Enrollment**: Many-to-many relationship between users and courses
- **Progress**: Tracks lesson completion per user
- **Quiz**: AI-generated quizzes linked to lessons
- **Question**: Multiple-choice questions with correct answers
- **QuizAttempt**: User quiz submissions with scores

---

## 🔐 Security

- **Password Hashing**: bcrypt with cost factor 12
- **JWT Sessions**: httpOnly cookies with NextAuth.js
- **Input Validation**: Zod schemas on all inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: React default escaping
- **CSRF Protection**: NextAuth.js built-in
- **Role-Based Access**: Middleware-enforced route protection

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma Client
npx prisma generate

# Rebuild
npm run build
```

### Database Connection Issues
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Verify database credentials
- Check connection pool limits

### AI Features Not Working
- Verify `GROQ_API_KEY` is set
- Check API rate limits
- Ensure video URLs are valid (YouTube/Loom)

---

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `GROQ_API_KEY` | Groq AI API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PRISMA_LOGGING` | Enable SQL query logging (true/false) | No |

---

## 🗺️ Roadmap

See the `roadmap/` folder for detailed sprint documentation:
- ✅ Sprint 1: Foundation & Authentication
- ✅ Sprint 2: Educator CRUD
- ✅ Sprint 3: Learner Experience
- ✅ Sprint 4: AI Quiz Generator
- ✅ Sprint 5: Testing & Polish
- 📋 Sprint 6: Deployment & Documentation

---

## 📄 License

This project is part of the House of Edtech Fullstack Assignment.

---

## 🤝 Contributing

This is an assignment project. For questions or issues, please contact the project maintainer.

---

**Built with ❤️ using Next.js, TypeScript, and AI**
