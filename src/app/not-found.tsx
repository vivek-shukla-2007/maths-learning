
// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-destructive mb-4">
            Oops! Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground">
            We couldn't find the page you were looking for.
          </p>
          <p className="text-md text-muted-foreground">
            It seems you've tried to access a route like <code className="bg-muted px-1 py-0.5 rounded text-sm">/page</code>, which doesn't exist in this application.
          </p>
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
