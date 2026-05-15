'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, LayoutDashboard, LogOut, User } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface PublicNavbarProps {
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export default function PublicNavbar({ 
  showBack = false, 
  backHref = '/',
  backLabel = 'Back',
  user = null
}: PublicNavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <h1 className="font-heading text-2xl font-bold text-blue-600 tracking-tight">
              LearnFlow
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(backHref)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Button>
            )}
            
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>

                <Link href={user.role === 'EDUCATOR' ? '/educator' : '/learner'}>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                </Link>

                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>

                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
