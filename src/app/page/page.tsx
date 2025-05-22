
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  // Return a simple loading state or null while redirecting
  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <p>Redirecting to homepage...</p>
    </div>
  );
}
