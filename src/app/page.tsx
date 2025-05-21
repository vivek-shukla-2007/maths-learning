
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Puzzle } from 'lucide-react';

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
        <Card className="w-full max-w-xs sm:max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
          <CardHeader className="items-center text-center p-6 bg-secondary/30">
            <div className="p-4 bg-accent/20 rounded-full mb-4 inline-block">
              <Puzzle className="h-12 w-12 md:h-16 md:w-16 text-accent" />
            </div>
            <CardTitle className="text-xl md:text-2xl">Place Value Puzzles</CardTitle>
            <CardDescription className="mt-1 text-sm md:text-base">Master tens and ones with fun challenges!</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <Link href="/apps/place-value" passHref>
              <Button size="lg" className="w-full text-base md:text-lg">
                Play Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* You can add more <Card> components here for future apps */}
        {/* Example of a placeholder card for a future app:
        <Card className="w-full max-w-xs sm:max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden opacity-50">
          <CardHeader className="items-center text-center p-6 bg-secondary/30">
            <div className="p-4 bg-muted/30 rounded-full mb-4 inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground"><path d="M12 2H2v10l9.29 9.29a2.82 2.82 0 0 0 4-4L12 2z"></path><path d="M7 7h.01"></path></svg>
            </div>
            <CardTitle className="text-xl md:text-2xl">Future App</CardTitle>
            <CardDescription className="mt-1 text-sm md:text-base">Coming Soon!</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <Button size="lg" className="w-full text-base md:text-lg" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
        */}
      </div>
    </div>
  );
}
