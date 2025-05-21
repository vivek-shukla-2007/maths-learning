
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
    <Card className="w-auto shadow-sm border-none bg-transparent"> {/* Made card less prominent */}
      <CardHeader className="p-1 pb-0 text-center md:text-left"> {/* Reduced padding */}
        <CardTitle className="text-md text-muted-foreground">Score</CardTitle> {/* Smaller title */}
      </CardHeader>
      <CardContent className="p-1 text-center md:text-left"> {/* Reduced padding */}
        <p className="text-2xl font-bold text-foreground"> {/* Smaller score, standard text color */}
          {correct} / {total}
        </p>
        {total > 0 && <p className="text-xs text-muted-foreground">({percentage}%)</p>} {/* Smaller percentage */}
      </CardContent>
    </Card>
  );
}
