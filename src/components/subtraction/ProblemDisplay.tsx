
"use client";

import type * as React from 'react';
import { Star, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

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

const DigitDisplayBox = ({
  digit,
  isBorrowVisualization = false, 
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
      isBorrowVisualization
        ? "border-orange-500 bg-orange-50 text-orange-700" 
        : isEmptyPlaceholder && effectiveDigit === ''
            ? "border-dashed border-muted-foreground/50"
            : "border-muted-foreground bg-background/50 text-primary",
       effectiveDigit === '' && !isBorrowVisualization && !isEmptyPlaceholder && "text-transparent",
    )}>
      {effectiveDigit || (isBorrowVisualization || isEmptyPlaceholder ? '' : '\u00A0')}
    </div>
  );
};


const PaddedNumber = ({ num }: { num: number}) => {
  const strNum = String(num);
  const onesDisplay = strNum.slice(-1);
  const tensDisplay = strNum.length > 1 ? strNum.slice(-2, -1) : '\u00A0'; 

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
  
  // Using addition-column-display class for consistent styling base
  const columnDisplayClass = "addition-column-display font-mono text-3xl sm:text-4xl md:text-5xl text-foreground w-full max-w-xs mx-auto";
  const stage3LineWidth = "calc(2 * theme(spacing.10) + theme(spacing.1))"; // For two w-10 boxes and gap-x-1

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 text-center w-full">
      {stageId === 'sub-visual' && (
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
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          <p className="text-5xl sm:text-6xl font-bold text-foreground">{problem.minuend}</p>
          <Minus className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          <p className="text-5xl sm:text-6xl font-bold text-foreground">{problem.subtrahend}</p>
          <p className="text-5xl sm:text-6xl font-bold text-primary"> = </p>
          <AnswerBox />
        </div>
      )}

      {stageId === 'sub-borrow' && (
         <div className={cn(columnDisplayClass)}>
          {/* Borrowing Visualization Row (Non-interactive placeholder for future enhancement) */}
          <div className="grid grid-cols-2 gap-x-1 w-auto min-h-[2.5rem] mb-0.5">
            {/* Example: <DigitDisplayBox digit={'4'} isBorrowVisualization={true} /> <DigitDisplayBox digit={'12'} isBorrowVisualization={true} /> */}
            {/* For now, it's just a spacer */}
            <div className="w-10"></div> 
            <div className="w-10"></div> 
          </div>

          {/* Minuend Row */}
          <PaddedNumber num={problem.minuend} />

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

    