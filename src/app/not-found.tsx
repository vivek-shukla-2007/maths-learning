
// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif', color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--background))', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ padding: '40px', border: '1px solid hsl(var(--border))', borderRadius: '8px', backgroundColor: 'hsl(var(--card))' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'hsl(var(--destructive))', marginBottom: '1rem' }}>
          Oops! Page Not Found
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'hsl(var(--muted-foreground))' }}>
          We couldn't find the page you were looking for.
        </p>
        <p style={{ fontSize: '1rem', color: 'hsl(var(--muted-foreground))', marginTop: '1rem' }}>
          It seems you've tried to access a route that doesn't exist in this application.
        </p>
        <Link href="/" style={{ marginTop: '2rem', display: 'inline-block' }}>
          <button style={{ padding: '12px 24px', fontSize: '1rem', cursor: 'pointer', backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: 'none', borderRadius: '0.5rem' }}>
            Go Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
