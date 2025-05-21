
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Removed Puzzle icon as we are using a custom SVG for Place Value Puzzles

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
            {/* CardContent with Button removed */}
          </Card>
        </Link>

        {/* You can add more <Card> components here for future apps, wrapped in <Link> */}
        {/* Example of a placeholder card for a future app:
        <Link href="#" className="block hover:cursor-pointer h-full opacity-50 pointer-events-none">
          <Card className="w-full max-w-xs sm:max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden h-full flex flex-col">
            <CardHeader className="items-center text-center p-6 bg-secondary/30 flex-grow">
              <div className="p-3 bg-muted/30 rounded-full mb-4 inline-flex items-center justify-center h-16 w-16 md:h-20 md:w-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 2H2v10l9.29 9.29a2.82 2.82 0 0 0 4-4L12 2z"></path><path d="M7 7h.01"></path></svg>
              </div>
              <CardTitle className="text-xl md:text-2xl">Future App</CardTitle>
              <CardDescription className="mt-1 text-sm md:text-base">Coming Soon!</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        */}
      </div>
    </div>
  );
}
