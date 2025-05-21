
"use client";

import type * as React from 'react';
import { Star, Plus } from 'lucide-react';
import { cn } from "@/lib/utils"; // Make sure cn is imported

interface AdditionProblem {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[]; // Used for Stage 1 & 2
  type: 'addition' | 'subtraction'; // For future expansion
  actualCarry: number; // The actual carry from the ones column sum (for stage 3 validation)
}

interface Stage3Inputs { // User's input for stage 3
  carry: string;
  sumTens: string;
  sumOnes: string;
}

interface ProblemDisplayProps {
  problem: AdditionProblem | null;
  stageId: string;
  stage3Inputs?: Stage3Inputs; // User's current input for stage 3
  // No actualCarry here, it's part of `problem`
}

const MAX_STARS_PER_ROW = 5;

// For displaying a blank answer box in Stage 1 and 2
const AnswerBox = () => (
  <div className="answer-box-visual">
    {/* Content is empty, styled by CSS class */}
  </div>
);

// For displaying individual digits in Stage 3 inputs (carry and sum)
const DigitDisplayBox = ({ 
  digit, 
  isUserInputCarry = false, // True if this box is for the user's carry input
  // isProblemCarryDisplay = false, // No longer needed as user inputs carry
  isEmptyPlaceholder = false // For purely empty visual box if needed (not currently used)
}: { 
  digit?: string | number; // The digit to display (from user input)
  isUserInputCarry?: boolean;
  // isProblemCarryDisplay?: boolean;
  isEmptyPlaceholder?: boolean;
}) => {
  
  let effectiveDigit = digit !== undefined ? digit.toString() : '';
  if (isEmptyPlaceholder) effectiveDigit = ''; // Should not be hit if displaying user input

  return (
    <div className={cn(
      "w-10 h-10 border-2 rounded-md flex items-center justify-center text-2xl font-mono",
      isUserInputCarry 
        ? "border-red-500 bg-red-50 text-red-700" // Style for user's CARRY input box
        : "border-muted-foreground bg-background/50 text-primary", // Default for SUM digit boxes
      // Removed problem carry display styles as user inputs carry now
    )}>
      {effectiveDigit}
    </div>
  );
};


// For displaying problem numbers (num1, num2) in Stage 3 column format
// Ensures that single digit numbers are padded for alignment with two-digit numbers
const PaddedNumber = ({ num }: { num: number}) => {
  const strNum = num.toString();
  // Ensure two "digits" for display; pad with non-breaking space if single digit for alignment
  const tensDisplay = strNum.length > 1 ? strNum[strNum.length - 2] : (num < 10 ? '\u00A0' : strNum[0]);
  const onesDisplay = strNum.length > 1 ? strNum[strNum.length - 1] : (num < 10 ? strNum[0] : strNum[1]);
  
  return (
    <div className="grid grid-cols-2 gap-1 text-right">
      {/* Each span acts as a column cell. Adjust font/size via parent. */}
      <span className="w-8 text-center">{tensDisplay}</span> 
      <span className="w-8 text-center">{onesDisplay}</span>
    </div>
  );
};


export function ProblemDisplay({ 
  problem, 
  stageId, 
  stage3Inputs = { carry: '', sumTens: '', sumOnes: '' } // Default for safety
}: ProblemDisplayProps): React.JSX.Element {
  if (!problem) {
    return <p className="text-muted-foreground text-xl">Loading problem...</p>;
  }

  // Renders stars for Stage 1
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
    return <div className="my-2 min-h-[50px]">{rows}</div>; // min-h for consistent spacing
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 text-center w-full">
      {/* Stage 1: Visual Counting */}
      {stageId === 'add-visual' && (
        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex flex-col items-center">
              {renderStars(problem.num1)}
              {/* Removed number display below stars: <p className="text-2xl font-bold text-foreground">{problem.num1}</p> */}
            </div>
            <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <div className="flex flex-col items-center">
              {renderStars(problem.num2)}
              {/* Removed number display below stars: <p className="text-2xl font-bold text-foreground">{problem.num2}</p> */}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 mt-3">
            <p className="text-3xl sm:text-4xl font-bold text-primary"> = </p>
            <AnswerBox /> {/* Blank box for answer */}
          </div>
        </div>
      )}

      {/* Stage 2: Numbers Only */}
      {stageId === 'add-numbers' && (
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          <p className="text-5xl sm:text-6xl font-bold text-foreground">{problem.num1}</p>
          <Plus className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          <p className="text-5xl sm:text-6xl font-bold text-foreground">{problem.num2}</p>
          <p className="text-5xl sm:text-6xl font-bold text-primary"> = </p>
          <AnswerBox /> {/* Blank box for answer */}
        </div>
      )}

      {/* Stage 3: Column Addition with Carry Input */}
      {stageId === 'add-carry' && (
        <div className="addition-column-display font-mono text-3xl sm:text-4xl md:text-5xl text-foreground w-full max-w-xs mx-auto">
          {/* User Input Carry Box - positioned by grid above tens column of problem numbers */}
          <div className="carry-row">
            <DigitDisplayBox 
              digit={stage3Inputs.carry}
              isUserInputCarry={true} // This styles it as the red input box
            /> 
            {/* The second column of the carry-row's grid is implicitly empty, which helps with alignment */}
          </div>

          {/* Problem Numbers */}
          <div className="operand-row">
            <PaddedNumber num={problem.num1} />
          </div>
          <div className="operator-operand-row">
            <span className="operator text-primary mr-2 sm:mr-4">+</span>
            <PaddedNumber num={problem.num2} />
          </div>
          <div className="line bg-foreground my-1 sm:my-2"></div>

          {/* User Input Sum Boxes */}
          <div className="result-row">
            {/* This inner grid aligns the sum digit boxes */}
            <div className="grid grid-cols-2 gap-1 text-right">
              <DigitDisplayBox digit={stage3Inputs.sumTens} /> 
              <DigitDisplayBox digit={stage3Inputs.sumOnes} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

    
