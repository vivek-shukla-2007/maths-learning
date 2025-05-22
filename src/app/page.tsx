
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Plus and Minus icons were for a generic puzzle icon, replaced by specific SVGs.
// If you need generic icons for other cards later, you can re-import them.
// import { Puzzle, Plus, MinusSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Learning Adventures',
  description: 'A collection of fun educational apps!',
};

export default function PortalHomePage() {
  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Learning Adventures</h1>
        <p className="text-lg md:text-xl text-muted-foreground">Select an app to start learning!</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {/* Place Value Puzzles Card */}
        <Link href="/apps/place-value" className="block hover:cursor-pointer h-full">
          <Card className="w-full max-w-xs sm:max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden h-full flex flex-col">
            <CardHeader className="items-center text-center p-6 bg-secondary/30 flex-grow">
              <div className="p-3 bg-accent/20 rounded-full mb-4 inline-flex items-center justify-center h-16 w-16 md:h-20 md:w-20">
                <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Place value icon showing 2 tens and 3 ones representing 23">
                  {/* Two Tens Stacks */}
                  <rect x="15" y="40" width="12" height="35" rx="2" fill="hsl(var(--primary))" />
                  <rect x="32" y="40" width="12" height="35" rx="2" fill="hsl(var(--primary))" />
                  {/* Three Ones Blocks */}
                  <rect x="55" y="60" width="10" height="10" rx="2" fill="hsl(var(--accent))" />
                  <rect x="70" y="60" width="10" height="10" rx="2" fill="hsl(var(--accent))" />
                  <rect x="85" y="60" width="10" height="10" rx="2" fill="hsl(var(--accent))" />
                  {/* Text "23" */}
                  <text x="50" y="28" fontFamily="sans-serif" fontSize="22" fill="hsl(var(--foreground))" textAnchor="middle" fontWeight="bold">23</text>
                </svg>
              </div>
              <CardTitle className="text-xl md:text-2xl">Place Value Puzzles</CardTitle>
              <CardDescription className="mt-1 text-sm md:text-base">Master tens and ones with fun challenges!</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Addition Adventure Card */}
        <Link href="/apps/addition" className="block hover:cursor-pointer h-full">
          <Card className="w-full max-w-xs sm:max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden h-full flex flex-col">
            <CardHeader className="items-center text-center p-6 bg-secondary/30 flex-grow">
              <div className="p-3 bg-accent/20 rounded-full mb-4 inline-flex items-center justify-center h-16 w-16 md:h-20 md:w-20">
                <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Addition icon showing 2 plus 3 equals 5">
                  <text x="50" y="35" fontFamily="sans-serif" fontSize="30" fill="hsl(var(--primary))" textAnchor="middle" fontWeight="bold">2</text>
                  <text x="50" y="60" fontFamily="sans-serif" fontSize="30" fill="hsl(var(--primary))" textAnchor="middle" fontWeight="bold">+</text>
                  <text x="50" y="85" fontFamily="sans-serif" fontSize="30" fill="hsl(var(--primary))" textAnchor="middle" fontWeight="bold">3</text>
                </svg>
              </div>
              <CardTitle className="text-xl md:text-2xl">Addition Adventure</CardTitle>
              <CardDescription className="mt-1 text-sm md:text-base">Practice your addition skills!</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Subtraction Sprints Card */}
        <Link href="/apps/subtraction" className="block hover:cursor-pointer h-full">
          <Card className="w-full max-w-xs sm:max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden h-full flex flex-col">
            <CardHeader className="items-center text-center p-6 bg-secondary/30 flex-grow">
              <div className="p-3 bg-accent/20 rounded-full mb-4 inline-flex items-center justify-center h-16 w-16 md:h-20 md:w-20">
                 <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Subtraction icon showing 5 minus 2 equals 3">
                  <text x="50" y="35" fontFamily="sans-serif" fontSize="30" fill="hsl(var(--primary))" textAnchor="middle" fontWeight="bold">5</text>
                  <text x="50" y="60" fontFamily="sans-serif" fontSize="30" fill="hsl(var(--primary))" textAnchor="middle" fontWeight="bold">-</text>
                  <text x="50" y="85" fontFamily="sans-serif" fontSize="30" fill="hsl(var(--primary))" textAnchor="middle" fontWeight="bold">2</text>
                </svg>
              </div>
              <CardTitle className="text-xl md:text-2xl">Subtraction Sprints</CardTitle>
              <CardDescription className="mt-1 text-sm md:text-base">Practice your subtraction skills!</CardDescription>
            </CardHeader>
          </Card>
        </Link>

      </div>
    </div>
  );
}
