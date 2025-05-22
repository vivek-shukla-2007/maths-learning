
"use client";

import type * as React from 'react';
import { Star, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SubtractionProblem {
  minuend: number;
  subtrahend: number;
  actualIsBorrowingNeeded?: boolean; // Still useful for problem generation logic
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

// Component to display a single digit for the user's answer input in Stage 3
const DigitDisplayBox = ({
  digit,
  isEmptyPlaceholder = false,
}: {
  digit?: string | number;
  isEmptyPlaceholder?: boolean;
}) => {
  let effectiveDigit = digit !== undefined ? String(digit) : '';
  if (isEmptyPlaceholder && effectiveDigit === '') effectiveDigit = ''; // Ensure empty string for placeholder

  return (
    <div className={cn(
      "w-10 h-10 border-2 rounded-md flex items-center justify-center text-2xl font-mono",
      isEmptyPlaceholder && effectiveDigit === ''
            ? "border-dashed border-muted-foreground/50" // Style for empty placeholder
            : "border-muted-foreground bg-background/50 text-primary", // Style for filled or non-placeholder
       effectiveDigit === '' && !isEmptyPlaceholder && "text-transparent", // Hide text if it's an empty non-placeholder
    )}>
      {/* Display the digit or a non-breaking space if it's an empty non-placeholder to maintain box height */}
      {effectiveDigit || (isEmptyPlaceholder ? '' : '\u00A0')}
    </div>
  );
};

// Component to display problem numbers (minuend, subtrahend) with padding for column alignment
const PaddedNumber = ({ num }: { num: number}) => {
  const strNum = String(num);
  // For a single digit number like 3, tens should be empty, ones should be '3'
  // For a two digit number like 12, tens is '1', ones is '2'
  const onesDisplay = strNum.slice(-1);
  const tensDisplay = strNum.length > 1 ? strNum.slice(-2, -1) : '\u00A0'; // Non-breaking space for empty tens

  return (
    <div className="grid grid-cols-2 gap-x-1 w-auto">
      {/* Each span represents a digit position */}
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
  
  // Use the same class as addition for column layout consistency
  const columnDisplayClass = "addition-column-display font-mono text-3xl sm:text-4xl md:text-5xl text-foreground w-full max-w-xs mx-auto";
  // Calculate line width based on two digit boxes and their gap
  const stage3LineWidth = "calc(2 * theme(spacing.10) + theme(spacing.1))"; // 2 * w-10 + gap-x-1

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

      {stageId === 'sub-borrow' && problem && (
         <div className={cn(columnDisplayClass)}>
          {/* Minuend Row - Simplified, no borrowing visualization */}
          <PaddedNumber num={problem.minuend} />
          
          {/* Operator + Subtrahend Row */}
          <div className="flex justify-end items-center w-full mt-1"> {/* mt-1 added for slight spacing */}
            <span className="operator text-primary mr-1 sm:mr-2 self-center">-</span>
            <PaddedNumber num={problem.subtrahend} />
          </div>

          {/* Line */}
          <div className="line-container flex justify-end w-full"> {/* Ensures line aligns with numbers */}
            <div
              className="line bg-foreground my-1 sm:my-2 h-[2px]" // my-1 or my-2 for spacing
              style={{ width: stage3LineWidth }} // Dynamic width for the line
            ></div>
          </div>

          {/* Result Row (Difference) - User input boxes */}
          <div className="grid grid-cols-2 gap-x-1 w-auto">
            <DigitDisplayBox digit={stage3Inputs.diffTens} isEmptyPlaceholder={true} />
            <DigitDisplayBox digit={stage3Inputs.diffOnes} isEmptyPlaceholder={true} />
          </div>
        </div>
      )}
    </div>
  );
}
