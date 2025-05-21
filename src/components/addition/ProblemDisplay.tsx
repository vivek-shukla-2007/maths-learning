
"use client";

import type * as React from 'react';
import { Star, Plus, Minus } from 'lucide-react'; // Assuming Minus might be used for subtraction later
import type { AdditionStage } from '@/lib/constants'; // Assuming type definition

interface AdditionProblem {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
  type: 'addition' | 'subtraction'; // For future expansion
}

interface ProblemDisplayProps {
  problem: AdditionProblem | null;
  stageId: string; 
}

const MAX_STARS_PER_ROW = 5;

export function ProblemDisplay({ problem, stageId }: ProblemDisplayProps): React.JSX.Element {
  if (!problem) {
    return <p className="text-muted-foreground text-xl">Loading problem...</p>;
  }

  const renderStars = (count: number) => {
    const rows = [];
    for (let i = 0; i < count; i += MAX_STARS_PER_ROW) {
      const rowStars = [];
      for (let j = 0; j < MAX_STARS_PER_ROW && (i + j) < count; j++) {
        rowStars.push(
          <Star key={`star-${i + j}`} className="h-8 w-8 text-accent fill-accent" />
        );
      }
      rows.push(
        <div key={`star-row-${i / MAX_STARS_PER_ROW}`} className="flex flex-wrap justify-center gap-1 mb-1">
          {rowStars}
        </div>
      );
    }
    return <div className="my-2">{rows}</div>;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
      {stageId === 'add-visual' && (
        <>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              {renderStars(problem.num1)}
              <p className="text-4xl font-bold text-foreground">{problem.num1}</p>
            </div>
            <Plus className="h-10 w-10 text-primary" />
            <div className="flex flex-col items-center">
              {renderStars(problem.num2)}
              <p className="text-4xl font-bold text-foreground">{problem.num2}</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-primary"> = ?</p>
        </>
      )}

      {stageId === 'add-numbers' && (
        <div className="flex items-center justify-center space-x-3">
          <p className="text-6xl font-bold text-foreground">{problem.num1}</p>
          <Plus className="h-12 w-12 text-primary" />
          <p className="text-6xl font-bold text-foreground">{problem.num2}</p>
          <p className="text-6xl font-bold text-primary"> = ?</p>
        </div>
      )}

      {stageId === 'add-carry' && (
        <div className="addition-column-display font-mono text-4xl md:text-5xl text-foreground">
          <div className="addition-operand addition-num1">{problem.num1}</div>
          <div className="addition-operator-operand">
            <span className="addition-operator text-primary">+</span>
            <span className="addition-num2">{problem.num2}</span>
          </div>
          <div className="addition-line"></div>
          <div className="addition-equals text-primary">?</div>
        </div>
      )}
    </div>
  );
}
