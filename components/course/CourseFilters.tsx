'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { COURSE_CATEGORIES, COURSE_DIFFICULTIES } from '@/lib/constants/course';

export function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('search', searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/courses?${params.toString()}`);
  }

  function clearFilters() {
    setSearchValue('');
    router.push('/courses');
  }

  const hasFilters = searchParams.get('category') || 
                     searchParams.get('difficulty') || 
                     searchParams.get('search');

  return (
    <div className="mb-8 flex flex-wrap gap-4">
      <Input
        placeholder="Search courses..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="max-w-xs"
      />

      <Select
        value={searchParams.get('category') || ''}
        onValueChange={(value) => updateFilter('category', value || '')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {COURSE_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('difficulty') || ''}
        onValueChange={(value) => updateFilter('difficulty', value || '')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Levels</SelectItem>
          {COURSE_DIFFICULTIES.map((diff) => (
            <SelectItem key={diff} value={diff}>
              {diff}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
