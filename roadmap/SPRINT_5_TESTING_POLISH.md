# Sprint 5 — Testing & Polish

**Duration:** 2 days  
**Goal:** Comprehensive testing, UI polish, accessibility, and error handling

---

## Phase 1: Unit Testing Setup (3 hours)

### Tasks
- [ ] Install Vitest and testing utilities
- [ ] Configure Vitest for Next.js
- [ ] Set up test database (separate from dev)
- [ ] Create test utilities and mocks
- [ ] Write tests for Zod schemas
- [ ] Write tests for utility functions

### Acceptance Criteria
- ✅ Vitest runs successfully with `npm run test`
- ✅ Test database isolated from development
- ✅ All validation schemas have test coverage
- ✅ Utility functions (embed, transcript) tested
- ✅ Tests run in CI pipeline

### Files Created
```
vitest.config.ts
tests/
├── setup.ts
├── utils/
│   ├── test-helpers.ts
│   └── mock-data.ts
└── unit/
    ├── validations.test.ts
    ├── embed.test.ts
    └── transcript.test.ts
```

### Implementation Notes

**Install dependencies:**
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom happy-dom
npm install -D @testing-library/user-event
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**tests/setup.ts:**
```typescript
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.NEXTAUTH_SECRET = 'test-secret';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
});
```

**tests/unit/validations.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '@/lib/validations/auth.schema';
import { courseSchema } from '@/lib/validations/course.schema';
import { lessonSchema } from '@/lib/validations/lesson.schema';

describe('Auth Validation', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'LEARNER' as const,
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        role: 'LEARNER' as const,
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        role: 'LEARNER' as const,
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('Course Validation', () => {
  it('should validate correct course data', () => {
    const data = {
      title: 'Test Course',
      description: 'This is a test course description',
      thumbnailUrl: 'https://example.com/image.jpg',
      category: 'Programming',
      difficulty: 'BEGINNER' as const,
      published: false,
    };

    const result = courseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject short title', () => {
    const data = {
      title: 'AB',
      description: 'This is a test course description',
      category: 'Programming',
      difficulty: 'BEGINNER' as const,
      published: false,
    };

    const result = courseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

**tests/unit/embed.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { parseVideoUrl, getEmbedUrl } from '@/lib/embed';

describe('Video Embed Utilities', () => {
  describe('parseVideoUrl', () => {
    it('should parse standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = parseVideoUrl(url);

      expect(result).toEqual({
        provider: 'youtube',
        embedId: 'dQw4w9WgXcQ',
      });
    });

    it('should parse short YouTube URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const result = parseVideoUrl(url);

      expect(result).toEqual({
        provider: 'youtube',
        embedId: 'dQw4w9WgXcQ',
      });
    });

    it('should parse Loom URL', () => {
      const url = 'https://www.loom.com/share/abc123def456';
      const result = parseVideoUrl(url);

      expect(result).toEqual({
        provider: 'loom',
        embedId: 'abc123def456',
      });
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/video';
      const result = parseVideoUrl(url);

      expect(result).toBeNull();
    });
  });

  describe('getEmbedUrl', () => {
    it('should generate YouTube embed URL', () => {
      const embed = { provider: 'youtube' as const, embedId: 'dQw4w9WgXcQ' };
      const url = getEmbedUrl(embed);

      expect(url).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should generate Loom embed URL', () => {
      const embed = { provider: 'loom' as const, embedId: 'abc123' };
      const url = getEmbedUrl(embed);

      expect(url).toBe('https://www.loom.com/embed/abc123');
    });
  });
});
```

**Update package.json:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## Phase 2: E2E Testing Setup (4 hours)

### Tasks
- [ ] Install Playwright
- [ ] Configure Playwright for Next.js
- [ ] Write auth flow E2E test
- [ ] Write course creation E2E test
- [ ] Write enrollment E2E test
- [ ] Write quiz flow E2E test

### Acceptance Criteria
- ✅ Playwright runs successfully
- ✅ Auth flow tested (register → login → logout)
- ✅ Course CRUD tested end-to-end
- ✅ Enrollment flow tested
- ✅ Quiz generation and attempt tested
- ✅ Tests run in headless mode for CI

### Files Created
```
playwright.config.ts
tests/
└── e2e/
    ├── auth.spec.ts
    ├── course-crud.spec.ts
    ├── enrollment.spec.ts
    └── quiz-flow.spec.ts
```

### Implementation Notes

**Install Playwright:**
```bash
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**tests/e2e/auth.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register new educator', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'Test Educator');
    await page.fill('input[name="email"]', `educator-${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="role"]', 'EDUCATOR');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/educator');
  });

  test('should register new learner', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'Test Learner');
    await page.fill('input[name="email"]', `learner-${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="role"]', 'LEARNER');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/learner');
  });

  test('should login and logout', async ({ page }) => {
    // Register first
    await page.goto('/register');
    const email = `user-${Date.now()}@test.com`;
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');

    // Login again
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/learner');
  });
});
```

**tests/e2e/course-crud.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Course CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login as educator
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test Educator');
    await page.fill('input[name="email"]', `educator-${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="role"]', 'EDUCATOR');
    await page.click('button[type="submit"]');
  });

  test('should create new course', async ({ page }) => {
    await page.goto('/educator/courses/new');

    await page.fill('input[name="title"]', 'Test Course');
    await page.fill('textarea[name="description"]', 'This is a test course description');
    await page.fill('input[name="category"]', 'Programming');
    await page.selectOption('select[name="difficulty"]', 'BEGINNER');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/educator');
    await expect(page.locator('text=Test Course')).toBeVisible();
  });

  test('should edit course', async ({ page }) => {
    // Create course first
    await page.goto('/educator/courses/new');
    await page.fill('input[name="title"]', 'Original Title');
    await page.fill('textarea[name="description"]', 'Original description');
    await page.fill('input[name="category"]', 'Programming');
    await page.click('button[type="submit"]');

    // Edit course
    await page.click('text=Original Title');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', 'Updated Title');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Updated Title')).toBeVisible();
  });

  test('should delete course', async ({ page }) => {
    // Create course first
    await page.goto('/educator/courses/new');
    await page.fill('input[name="title"]', 'Course to Delete');
    await page.fill('textarea[name="description"]', 'Will be deleted');
    await page.fill('input[name="category"]', 'Programming');
    await page.click('button[type="submit"]');

    // Delete course
    await page.click('text=Course to Delete');
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")'); // Confirmation dialog

    await expect(page.locator('text=Course to Delete')).not.toBeVisible();
  });
});
```

**Update package.json:**
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Phase 3: UI Polish & Responsive Design (4 hours)

### Tasks
- [ ] Audit all pages on mobile, tablet, desktop
- [ ] Add loading skeletons for async content
- [ ] Add empty states for all lists
- [ ] Improve form error messages
- [ ] Add success/error toast notifications
- [ ] Polish button states (hover, active, disabled)
- [ ] Ensure consistent spacing and typography

### Acceptance Criteria
- ✅ All pages responsive on mobile (320px+)
- ✅ Loading states show during async operations
- ✅ Empty states are friendly and actionable
- ✅ Form errors are clear and helpful
- ✅ Toast notifications for all user actions
- ✅ Consistent design system throughout

### Implementation Checklist

**Loading States:**
```typescript
// Use Suspense boundaries
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>

// Use loading states in client components
{isLoading ? <Spinner /> : <Content />}
```

**Empty States:**
```typescript
// Example empty state
{items.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">No items found</p>
    <Button>Create Your First Item</Button>
  </div>
)}
```

**Toast Notifications:**
```typescript
import { useToast } from '@/components/ui/use-toast';

const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Your changes have been saved',
});

toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});
```

**Responsive Breakpoints:**
```
sm: 640px   (mobile landscape)
md: 768px   (tablet)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
```

---

## Phase 4: Accessibility Audit (3 hours)

### Tasks
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works everywhere
- [ ] Test with screen reader (NVDA or VoiceOver)
- [ ] Add focus indicators to all focusable elements
- [ ] Ensure color contrast meets WCAG AA
- [ ] Add skip-to-content link
- [ ] Test form validation with screen reader

### Acceptance Criteria
- ✅ All buttons and links have accessible labels
- ✅ Tab navigation works logically
- ✅ Focus indicators visible on all elements
- ✅ Color contrast ratio ≥ 4.5:1 for text
- ✅ Forms announce errors to screen readers
- ✅ Modal dialogs trap focus correctly

### Implementation Notes

**ARIA Labels:**
```typescript
<button aria-label="Delete course">
  <TrashIcon />
</button>

<input
  type="text"
  aria-label="Search courses"
  aria-describedby="search-help"
/>
<span id="search-help" className="sr-only">
  Enter keywords to search
</span>
```

**Keyboard Navigation:**
```typescript
// Ensure all interactive elements are keyboard accessible
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

**Focus Management:**
```typescript
// Add visible focus indicators
.focus-visible:focus {
  outline: 2px solid blue;
  outline-offset: 2px;
}

// Trap focus in modals
import { FocusTrap } from '@headlessui/react';

<FocusTrap>
  <Dialog>...</Dialog>
</FocusTrap>
```

**Screen Reader Only Text:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Phase 5: Error Handling & Edge Cases (3 hours)

### Tasks
- [ ] Add error boundaries for React errors
- [ ] Handle network errors gracefully
- [ ] Add retry logic for failed API calls
- [ ] Handle expired sessions
- [ ] Add 404 and 500 error pages
- [ ] Test all edge cases (empty data, long text, special characters)

### Acceptance Criteria
- ✅ App doesn't crash on errors
- ✅ Network errors show retry option
- ✅ Expired sessions redirect to login
- ✅ Custom error pages for 404 and 500
- ✅ All edge cases handled gracefully

### Implementation Notes

**Error Boundary:**
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
```

**404 Page:**
```typescript
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link href="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  );
}
```

**Session Expiry Handling:**
```typescript
// middleware.ts
export default withAuth(
  function middleware(req) {
    // ... existing code
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) {
          // Session expired
          return false;
        }
        return true;
      },
    },
  }
);
```

---

## Phase 6: Performance Optimization (2 hours)

### Tasks
- [ ] Add `next/image` for all images
- [ ] Implement ISR for public pages
- [ ] Add loading="lazy" to images
- [ ] Optimize bundle size (check with `npm run build`)
- [ ] Add caching headers
- [ ] Minimize client-side JavaScript

### Acceptance Criteria
- ✅ All images use `next/image`
- ✅ Public pages use ISR
- ✅ Bundle size < 200KB (gzipped)
- ✅ Lighthouse score > 90
- ✅ No unnecessary client components

### Implementation Notes

**Image Optimization:**
```typescript
import Image from 'next/image';

<Image
  src={course.thumbnailUrl}
  alt={course.title}
  width={400}
  height={300}
  className="rounded-lg"
  loading="lazy"
/>
```

**ISR Configuration:**
```typescript
// app/courses/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

**Bundle Analysis:**
```bash
npm run build
# Check output for bundle sizes
```

---

## Sprint 5 Completion Checklist

- [ ] Unit tests written and passing
- [ ] E2E tests written and passing
- [ ] All pages responsive on mobile/tablet/desktop
- [ ] Loading states and empty states added
- [ ] Accessibility audit completed
- [ ] Error handling for all edge cases
- [ ] Performance optimizations applied
- [ ] All tests passing in CI
- [ ] Code committed to Git

---

**Next Sprint:** Sprint 6 — Deployment & Documentation
