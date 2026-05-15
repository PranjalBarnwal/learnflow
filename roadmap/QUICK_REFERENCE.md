# LearnFlow Quick Reference Guide

> Essential commands, patterns, and snippets for rapid development

---

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Create Next.js project
npx create-next-app@latest learnflow --typescript --tailwind --app

# Install dependencies
npm install @prisma/client prisma next-auth@beta bcryptjs zod
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
npm install youtube-transcript groq-sdk react-markdown
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Dev dependencies
npm install -D @types/bcryptjs tsx
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test

# Setup shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input card label form select textarea toast
```

### Database Commands
```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Seed database
npm run db:seed

# Reset database (dev only)
npx prisma migrate reset
```

### Development
```bash
# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Run tests
npm run test
npm run test:watch
npm run test:e2e
```

### Deployment
```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check build locally
npm run build
npm run start
```

---

## 📁 Project Structure Reference

```
learnflow/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── educator/             # Educator-only routes
│   │   └── learner/              # Learner-only routes
│   ├── courses/                  # Public course listing
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   └── ai/generate-quiz/     # AI endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── error.tsx                 # Error boundary
│   └── not-found.tsx             # 404 page
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── course/                   # Course-related components
│   ├── lesson/                   # Lesson-related components
│   ├── quiz/                     # Quiz-related components
│   ├── layout/                   # Layout components (Navbar, Footer)
│   └── shared/                   # Shared components (ProgressBar)
│
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   ├── groq.ts                   # Groq AI client
│   ├── transcript.ts             # YouTube transcript extraction
│   ├── embed.ts                  # Video URL parsing
│   └── validations/              # Zod schemas
│
├── actions/                      # Server Actions
│   ├── auth.actions.ts
│   ├── course.actions.ts
│   ├── lesson.actions.ts
│   ├── enrollment.actions.ts
│   ├── progress.actions.ts
│   └── quiz.actions.ts
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed script
│   └── migrations/               # Migration history
│
├── tests/
│   ├── unit/                     # Vitest unit tests
│   └── e2e/                      # Playwright E2E tests
│
├── middleware.ts                 # Route protection
├── .env.local                    # Environment variables (gitignored)
└── .env.example                  # Example env vars (committed)
```

---

## 🔑 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Groq AI
GROQ_API_KEY="your-groq-api-key"

# Node Environment
NODE_ENV="development"
```

### Generate Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🎨 Common Code Patterns

### Server Action Template
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { schema, type Input } from '@/lib/validations/schema';

export async function actionName(data: Input) {
  try {
    // 1. Get session
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: 'Unauthorized' };
    }

    // 2. Validate input
    const validated = schema.parse(data);

    // 3. Check permissions
    // ... ownership checks

    // 4. Database operation
    const result = await db.model.create({
      data: validated,
    });

    // 5. Revalidate cache
    revalidatePath('/path');

    return { success: true, result };
  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Operation failed' };
  }
}
```

### Server Component with Data Fetching
```typescript
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getData() {
  const data = await db.model.findMany({
    where: { published: true },
    include: { relation: true },
    orderBy: { createdAt: 'desc' },
  });
  return data;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const data = await getData();

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### Client Component with Form
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schema, type Input } from '@/lib/validations/schema';
import { actionName } from '@/actions/actions';
import { useToast } from '@/components/ui/use-toast';

export function FormComponent() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: {
      field: '',
    },
  });

  async function onSubmit(data: Input) {
    setIsLoading(true);
    const result = await actionName(data);
    setIsLoading(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Operation completed',
    });

    router.push('/path');
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Zod Schema Template
```typescript
import { z } from 'zod';

export const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  enum: z.enum(['OPTION1', 'OPTION2', 'OPTION3']),
  boolean: z.boolean().default(false),
  number: z.number().int().min(0),
});

export type Input = z.infer<typeof schema>;
```

---

## 🗄️ Common Prisma Queries

### Create
```typescript
const user = await db.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: hashedPassword,
  },
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### Find Unique
```typescript
const user = await db.user.findUnique({
  where: { email: 'john@example.com' },
  include: {
    courses: true,
  },
});
```

### Find Many with Filters
```typescript
const courses = await db.course.findMany({
  where: {
    published: true,
    category: 'Programming',
    difficulty: 'BEGINNER',
  },
  include: {
    educator: {
      select: { name: true },
    },
    _count: {
      select: {
        lessons: true,
        enrollments: true,
      },
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});
```

### Update
```typescript
const course = await db.course.update({
  where: { id: courseId },
  data: {
    title: 'Updated Title',
    published: true,
  },
});
```

### Upsert
```typescript
const progress = await db.progress.upsert({
  where: {
    userId_lessonId: {
      userId: session.user.id,
      lessonId: lessonId,
    },
  },
  update: {
    completedAt: new Date(),
  },
  create: {
    userId: session.user.id,
    lessonId: lessonId,
  },
});
```

### Delete
```typescript
await db.course.delete({
  where: { id: courseId },
});
```

### Transaction
```typescript
await db.$transaction(
  lessonIds.map((lessonId, index) =>
    db.lesson.update({
      where: { id: lessonId },
      data: { orderIndex: index },
    })
  )
);
```

---

## 🔐 Auth Patterns

### Get Session in Server Component
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session) redirect('/login');
```

### Get Session in Client Component
```typescript
'use client';

import { useSession } from 'next-auth/react';

export function Component() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Hello {session.user.name}</div>;
}
```

### Protect Route in Middleware
```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Custom logic
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/educator/:path*', '/learner/:path*'],
};
```

---

## 🎨 UI Component Patterns

### Loading Skeleton
```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
```

### Empty State
```typescript
export function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">No items found</p>
      <Button>Create Your First Item</Button>
    </div>
  );
}
```

### Error State
```typescript
export function ErrorState({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={retry}>Try Again</Button>
    </div>
  );
}
```

### Toast Notification
```typescript
import { useToast } from '@/components/ui/use-toast';

const { toast } = useToast();

// Success
toast({
  title: 'Success',
  description: 'Your changes have been saved',
});

// Error
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});

// With action
toast({
  title: 'Scheduled',
  description: 'Your post will be published soon',
  action: <Button size="sm">Undo</Button>,
});
```

---

## 🧪 Testing Patterns

### Unit Test Template
```typescript
import { describe, it, expect } from 'vitest';
import { schema } from '@/lib/validations/schema';

describe('Schema Validation', () => {
  it('should validate correct data', () => {
    const data = { field: 'value' };
    const result = schema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid data', () => {
    const data = { field: '' };
    const result = schema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup (login, navigate, etc.)
  });

  test('should complete flow', async ({ page }) => {
    await page.goto('/path');
    await page.fill('input[name="field"]', 'value');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/success');
  });
});
```

---

## 🐛 Debugging Tips

### Check Prisma Queries
```typescript
// Enable query logging in development
const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

### Debug Server Actions
```typescript
export async function actionName(data: Input) {
  console.log('Input:', data);
  
  try {
    const result = await db.model.create({ data });
    console.log('Result:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error:', error);
    return { error: 'Failed' };
  }
}
```

### Check Session
```typescript
const session = await getServerSession(authOptions);
console.log('Session:', JSON.stringify(session, null, 2));
```

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  }
}
```

---

## 🚨 Common Errors & Solutions

### Error: Prisma Client not found
```bash
npx prisma generate
```

### Error: NextAuth session not persisting
Check `.env.local`:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### Error: Module not found
```bash
npm install
# or
rm -rf node_modules package-lock.json
npm install
```

### Error: Port 3000 already in use
```bash
# Kill process on port 3000
npx kill-port 3000
# or
lsof -ti:3000 | xargs kill
```

### Error: Database connection failed
Check `DATABASE_URL` in `.env.local` and ensure PostgreSQL is running

---

## 📚 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zod Docs](https://zod.dev)
- [Groq API Docs](https://console.groq.com/docs)

---

**Keep this guide handy while building LearnFlow!** 🚀
