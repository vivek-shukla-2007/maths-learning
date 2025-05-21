
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
    {/* Content will be empty, representing a blank box. Styling handles the box appearance. */}
  </div>
);

// For displaying individual digits in Stage 3 inputs or carry
const DigitDisplayBox = ({ 
  digit, 
  isUserInputCarry = false,
  isProblemCarryDisplay = false, // If we were to display the actual carry from problem for context
  isEmptyPlaceholder = false // For purely empty visual box if needed
}: { 
  digit?: string | number;
  isUserInputCarry?: boolean;
  isProblemCarryDisplay?: boolean;
  isEmptyPlaceholder?: boolean;
}) => {
  
  let effectiveDigit = digit !== undefined ? digit.toString() : '';
  if (isEmptyPlaceholder) effectiveDigit = '';

  return (
    <div className={cn(
      "w-10 h-10 border-2 rounded-md flex items-center justify-center text-2xl font-mono",
      isUserInputCarry 
        ? "border-red-500 bg-red-50 text-red-700" // User's carry input box
        : "border-muted-foreground bg-background/50 text-primary", // Default for sum digits
      (isProblemCarryDisplay && digit === 0) ? "border-transparent text-transparent bg-transparent" : "", // Hide '0' if it's problem carry
      (isProblemCarryDisplay && digit !== 0 && digit !== undefined) ? "border-primary bg-primary/10 text-primary" : "" // Style for non-zero problem carry
    )}>
      {effectiveDigit}
    </div>
  );
};


const PaddedNumber = ({ num }: { num: number}) => {
  const strNum = num.toString();
  // Ensure two digits, pad with non-breaking space if single digit
  const tens = strNum.length > 1 ? strNum[strNum.length - 2] : (strNum.length === 1 && num < 10 ? '\u00A0' : strNum[0]);
  const ones = strNum.length > 1 ? strNum[strNum.length - 1] : (strNum.length === 1 ? strNum[0] : strNum[1]);
  
  // If the number is single digit, display it in the ones place, tens is space
  if (num < 10) {
    return (
      <div className="grid grid-cols-2 gap-1 text-right">
        <span>&nbsp;</span> 
        <span>{num}</span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1 text-right">
      <span>{tens}</span>
      <span>{ones}</span>
    </div>
  );
};


export function ProblemDisplay({ problem, stageId, stage3Inputs = { carry: '', sumTens: '', sumOnes: '' } }: ProblemDisplayProps): React.JSX.Element {
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
            <div className="flex flex-col items-center">
              {renderStars(problem.num1)}
            </div>
            <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <div className="flex flex-col items-center">
              {renderStars(problem.num2)}
            </div>
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
          {/* User Input Carry Box */}
          <div className="carry-row">
            <DigitDisplayBox 
              digit={stage3Inputs.carry}
              isUserInputCarry={true}
            /> 
            <div className="w-10 h-10"></div> {/* Spacer for ones column alignment */}
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

    