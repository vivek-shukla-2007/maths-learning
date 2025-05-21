"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreDisplayProps {
  correct: number;
  total: number;
}

export function ScoreDisplay({ correct, total }: ScoreDisplayProps): React.JSX.Element {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Card className="w-full max-w-xs shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-xl text-primary">Your Score</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-3xl font-bold text-accent-foreground">
          {correct} / {total}
        </p>
        {total > 0 && <p className="text-sm text-muted-foreground">({percentage}%)</p>}
      </CardContent>
    </Card>
  );
}
