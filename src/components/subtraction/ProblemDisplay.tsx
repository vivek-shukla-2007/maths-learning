
"use client";

import type * as React from 'react';
import { Star, Minus } from 'lucide-react';
import { cn } from "@/lib/utils"; // Ensure cn is imported

interface SubtractionProblem {
  minuend: number;
  subtrahend: number;
  actualIsBorrowingNeeded?: boolean;
}

interface Stage3Inputs {
  diffTens: string;
  diffOnes: string;
}

interface ProblemDisplayProps {
  problem: SubtractionProblem | null;
  stageId: string;
  stage3Inputs?: Stage3Inputs;
}

const MAX_STARS_PER_ROW = 5;

const AnswerBox = () => (
  <div className="answer-box-visual">
  </div>
);

// Component to display a single digit, used for Stage 3 sum input boxes
const DigitDisplayBox = ({
  digit,
  isBorrowVisualization = false, // Not used in this version, kept for potential future use
  isEmptyPlaceholder = false,
}: {
  digit?: string | number;
  isBorrowVisualization?: boolean;
  isEmptyPlaceholder?: boolean;
}) => {
  let effectiveDigit = digit !== undefined ? String(digit) : '';
  if (isEmptyPlaceholder && effectiveDigit === '') effectiveDigit = '';

  return (
    <div className={cn(
      "w-10 h-10 border-2 rounded-md flex items-center justify-center text-2xl font-mono",
      // isBorrowVisualization: Handled by direct styling in Stage 3 minuend display
      isEmptyPlaceholder && effectiveDigit === ''
            ? "border-dashed border-muted-foreground/50"
            : "border-muted-foreground bg-background/50 text-primary",
       effectiveDigit === '' && !isEmptyPlaceholder && "text-transparent",
    )}>
      {effectiveDigit || (isEmptyPlaceholder ? '' : '\u00A0')}
    </div>
  );
};

// Component to display problem numbers (subtrahend) with padding for column alignment
const PaddedNumber = ({ num }: { num: number}) => {
  const strNum = String(num);
  const onesDisplay = strNum.slice(-1);
  const tensDisplay = strNum.length > 1 ? strNum.slice(-2, -1) : '\u00A0'; // Non-breaking space

  return (
    <div className="grid grid-cols-2 gap-x-1 w-auto">
      <span className="w-10 text-center">{tensDisplay}</span>
      <span className="w-10 text-center">{onesDisplay}</span>
    </div>
  );
};


export function ProblemDisplay({
  problem,
  stageId,
  stage3Inputs = { diffTens: '', diffOnes: '' }
}: ProblemDisplayProps): React.JSX.Element {
  if (!problem) {
    return <p className="text-muted-foreground text-xl">Loading problem...</p>;
  }

  const renderStars = (count: number, isSubtrahend?: boolean) => {
    const rows = [];
    for (let i = 0; i < count; i += MAX_STARS_PER_ROW) {
      const rowStars = [];
      for (let j = 0; j < MAX_STARS_PER_ROW && (i + j) < count; j++) {
        rowStars.push(
          <Star 
            key={`star-${i + j}`} 
            className={cn(
                "h-6 w-6 sm:h-8 sm:w-8", 
                isSubtrahend ? "text-red-400 fill-red-400/50" : "text-accent fill-accent"
            )} 
          />
        );
      }
      rows.push(
        <div key={`star-row-${i / MAX_STARS_PER_ROW}`} className="flex flex-wrap justify-center gap-1 mb-1">
          {rowStars}
        </div>
      );
    }
    return <div className="my-2 min-h-[50px]">{rows}</div>;
  };
  
  const columnDisplayClass = "addition-column-display font-mono text-3xl sm:text-4xl md:text-5xl text-foreground w-full max-w-xs mx-auto";
  const stage3LineWidth = "calc(2 * theme(spacing.10) + theme(spacing.1))"; 

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 text-center w-full">
      {stageId === 'sub-visual' && (
        // ... (Visual stage remains the same)
        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex flex-col items-center">{renderStars(problem.minuend)}</div>
            <Minus className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <div className="flex flex-col items-center">{renderStars(problem.subtrahend, true)}</div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 mt-3">
            <p className="text-3xl sm:text-4xl font-bold text-primary"> = </p>
            <AnswerBox />
          </div>
        </div>
      )}

      {stageId === 'sub-numbers' && (
        // ... (Numbers stage remains the same)
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          <p className="text-5xl sm:text-6xl font-bold text-foreground">{problem.minuend}</p>
          <Minus className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          <p className="text-5xl sm:text-6xl font-bold text-foreground">{problem.subtrahend}</p>
          <p className="text-5xl sm:text-6xl font-bold text-primary"> = </p>
          <AnswerBox />
        </div>
      )}

      {stageId === 'sub-borrow' && problem && (
         <div className={cn(columnDisplayClass)}>
          {/* Minuend Row with Borrowing Visualization */}
          <div className="grid grid-cols-2 gap-x-1 w-auto text-center mb-1 relative">
            {(() => {
              const minuendTensOriginal = Math.floor(problem.minuend / 10);
              const minuendOnesOriginal = problem.minuend % 10;
              
              if (problem.actualIsBorrowingNeeded) {
                const newTens = minuendTensOriginal - 1;
                const newOnes = minuendOnesOriginal + 10;
                return (
                  <>
                    {/* Tens Column */}
                    <div className="relative h-12 flex flex-col items-center justify-center">
                      <span className="absolute top-0 text-xl text-orange-500 font-semibold">{newTens < 0 ? ' ' : newTens}</span>
                      <span className="mt-5 line-through text-muted-foreground/60">{minuendTensOriginal || '\u00A0'}</span>
                    </div>
                    {/* Ones Column */}
                    <div className="relative h-12 flex flex-col items-center justify-center">
                      <span className="absolute top-0 text-xl text-orange-500 font-semibold">{newOnes}</span>
                      <span className="mt-5 line-through text-muted-foreground/60">{minuendOnesOriginal}</span>
                    </div>
                  </>
                );
              } else {
                // Should not happen for 'sub-borrow' stage due to problem generation logic, but as a fallback:
                return (
                  <>
                    <span className="w-10 text-center">{minuendTensOriginal || '\u00A0'}</span>
                    <span className="w-10 text-center">{minuendOnesOriginal}</span>
                  </>
                );
              }
            })()}
          </div>

          {/* Operator + Subtrahend Row */}
          <div className="flex justify-end items-center w-full mt-1">
            <span className="operator text-primary mr-1 sm:mr-2 self-center">-</span>
            <PaddedNumber num={problem.subtrahend} />
          </div>

          {/* Line */}
          <div className="line-container flex justify-end w-full">
            <div
              className="line bg-foreground my-1 sm:my-2 h-[2px]"
              style={{ width: stage3LineWidth }}
            ></div>
          </div>

          {/* Result Row (Difference) */}
          <div className="grid grid-cols-2 gap-x-1 w-auto">
            <DigitDisplayBox digit={stage3Inputs.diffTens} isEmptyPlaceholder={true} />
            <DigitDisplayBox digit={stage3Inputs.diffOnes} isEmptyPlaceholder={true} />
          </div>
        </div>
      )}
    </div>
  );
}
