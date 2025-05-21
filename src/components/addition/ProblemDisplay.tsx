
"use client";

import type * as React from 'react';
import { Star, Plus } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AdditionProblem {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
  type: 'addition' | 'subtraction';
  actualCarry: number; 
}

interface Stage3Inputs {
  carry: string;
  sumTens: string;
  sumOnes: string;
}

interface ProblemDisplayProps {
  problem: AdditionProblem | null;
  stageId: string;
  stage3Inputs?: Stage3Inputs;
}

const MAX_STARS_PER_ROW = 5;

const AnswerBox = () => (
  <div className="answer-box-visual">
    {/* Content is empty, styled by CSS class */}
  </div>
);

const DigitDisplayBox = ({ 
  digit, 
  isUserInputCarry = false,
  isEmptyPlaceholder = false
}: { 
  digit?: string | number;
  isUserInputCarry?: boolean;
  isEmptyPlaceholder?: boolean;
}) => {
  let effectiveDigit = digit !== undefined ? digit.toString() : '';
  if (isEmptyPlaceholder) effectiveDigit = '';

  return (
    <div className={cn(
      "w-10 h-10 border-2 rounded-md flex items-center justify-center text-2xl font-mono",
      isUserInputCarry 
        ? "border-red-500 bg-red-50 text-red-700" // Style for user's CARRY input box
        : "border-muted-foreground bg-background/50 text-primary", // Default for SUM digit boxes
       isEmptyPlaceholder && !isUserInputCarry && "bg-transparent border-dashed", // Special for purely empty sum boxes if needed
       effectiveDigit === '' && !isUserInputCarry && "text-transparent", // Make placeholder text in sum boxes invisible
    )}>
      {effectiveDigit || (isUserInputCarry ? '' : '\u00A0')} {/* Render space if empty unless it's carry */}
    </div>
  );
};

// For displaying problem numbers (num1, num2) in Stage 3 column format
const PaddedNumber = ({ num }: { num: number}) => {
  const strNum = num.toString();
  const isSingleDigit = num < 10;
  
  // For a number like 9, tensDisplay should be an empty space for alignment.
  // For a number like 13, tensDisplay is '1'.
  const tensDisplay = isSingleDigit ? '\u00A0' : strNum[strNum.length - 2]; // Use non-breaking space for empty tens
  const onesDisplay = isSingleDigit ? strNum[0] : strNum[strNum.length - 1];
  
  return (
    <div className="grid grid-cols-2 gap-0"> {/* Reduced gap for tighter alignment */}
      {/* Each span acts as a column cell. Align with DigitDisplayBox */}
      <span className="w-10 text-center">{tensDisplay}</span> 
      <span className="w-10 text-center">{onesDisplay}</span>
    </div>
  );
};


export function ProblemDisplay({ 
  problem, 
  stageId, 
  stage3Inputs = { carry: '', sumTens: '', sumOnes: '' }
}: ProblemDisplayProps): React.JSX.Element {
  if (!problem) {
    return <p className="text-muted-foreground text-xl">Loading problem...</p>;
  }

  const renderStars = (count: number) => {
    const rows = [];
    for (let i = 0; i < count; i += MAX_STARS_PER_ROW) {
      const rowStars = [];
      for (let j = 0; j < MAX_STARS_PER_ROW && (i + j) < count; j++) {
        rowStars.push(
          <Star key={`star-${i + j}`} className="h-6 w-6 sm:h-8 sm:w-8 text-accent fill-accent" />
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

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 text-center w-full">
      {stageId === 'add-visual' && (
        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex flex-col items-center">{renderStars(problem.num1)}</div>
            <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <div className="flex flex-col items-center">{renderStars(problem.num2)}</div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 mt-3">
            <p className="text-3xl sm:text-4xl font-bold text-primary"> = </p>
            <AnswerBox />
          </div>
        </div>
      )}

      {stageId === 'add-numbers' && (
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          <p className="text-5xl sm:text-6xl font-bold text-foreground">{problem.num1}</p>
          <Plus className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          <p className="text-5xl sm:text-6xl font-bold text-foreground">{problem.num2}</p>
          <p className="text-5xl sm:text-6xl font-bold text-primary"> = </p>
          <AnswerBox />
        </div>
      )}

      {stageId === 'add-carry' && (
        <div className="addition-column-display font-mono text-3xl sm:text-4xl md:text-5xl text-foreground w-full max-w-xs mx-auto">
          <div className="carry-row">
             {/* This div is a spacer to push the carry box to the correct column if using a 2-column grid for carry-row */}
            <div>{/* Invisible spacer for alignment over TENS column */}</div>
            <DigitDisplayBox 
              digit={stage3Inputs.carry}
              isUserInputCarry={true}
            /> 
          </div>

          <div className="operand-row"><PaddedNumber num={problem.num1} /></div>
          <div className="operator-operand-row">
            <span className="operator text-primary mr-1 sm:mr-2">+</span> {/* Adjusted margin for + */}
            <PaddedNumber num={problem.num2} />
          </div>
          <div className="line bg-foreground my-1 sm:my-2"></div>

          <div className="result-row">
            <div className="grid grid-cols-2 gap-0"> {/* Reduced gap for tighter alignment */}
              <DigitDisplayBox digit={stage3Inputs.sumTens} /> 
              <DigitDisplayBox digit={stage3Inputs.sumOnes} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
