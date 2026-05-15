import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award, Sparkles, ArrowRight, GraduationCap, Video, CheckCircle } from 'lucide-react';

export const runtime = 'nodejs';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === 'EDUCATOR') {
      redirect('/educator');
    } else {
      redirect('/learner');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="font-heading text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LearnFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-blue-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium animate-bounce-subtle">
              <Sparkles className="h-4 w-4" />
              <span>Transform Your Learning Journey</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Learn Smarter,
              </span>
              <br />
              <span className="text-gray-900">Grow Faster</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of learners and educators on a platform designed to make education accessible, engaging, and effective.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all group">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-blue-50">
                  Explore Courses
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center animate-fade-in-delay-1">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600 mt-1">Active Learners</div>
              </div>
              <div className="text-center animate-fade-in-delay-2">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">500+</div>
                <div className="text-sm text-gray-600 mt-1">Expert Educators</div>
              </div>
              <div className="text-center animate-fade-in-delay-3">
                <div className="text-3xl md:text-4xl font-bold text-pink-600">1000+</div>
                <div className="text-sm text-gray-600 mt-1">Quality Courses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LearnFlow</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-delay-1">
              <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">Rich Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Access comprehensive courses with video lessons, interactive quizzes, and downloadable resources.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-delay-2">
              <div className="h-14 w-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">Expert Educators</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn from industry professionals and experienced teachers who are passionate about education.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-delay-3">
              <div className="h-14 w-14 bg-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">Track Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your learning journey with detailed analytics and earn certificates upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Start Learning in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300"></div>
            
            <div className="text-center relative animate-fade-in-delay-1">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Create Account</h3>
              <p className="text-gray-600">Sign up for free and choose your role as a learner or educator</p>
            </div>

            <div className="text-center relative animate-fade-in-delay-2">
              <div className="h-20 w-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Browse Courses</h3>
              <p className="text-gray-600">Explore our vast library of courses across various subjects</p>
            </div>

            <div className="text-center relative animate-fade-in-delay-3">
              <div className="h-20 w-20 bg-gradient-to-br from-pink-600 to-pink-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Start Learning</h3>
              <p className="text-gray-600">Begin your journey and track your progress along the way</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 animate-fade-in">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl text-blue-100 mb-8 animate-fade-in-delay-1">
            Join our community today and unlock unlimited learning opportunities
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all group animate-fade-in-delay-2">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6 text-blue-400" />
              <span className="font-heading text-xl font-bold text-white">LearnFlow</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 LearnFlow. Empowering learners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
