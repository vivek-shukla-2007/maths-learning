
"use client";

import type * as React from 'react';
import { Star, Plus } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AdditionProblem {
  num1: number;
  num2: number;
  actualCarry?: number; // Used for validation, not direct display by ProblemDisplay
  // correctAnswer, options, type are part of the problem object passed
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

// Visual representation of an empty answer box for Stages 1 & 2
const AnswerBox = () => (
  <div className="answer-box-visual">
    {/* Content is empty, styled by CSS class in globals.css */}
  </div>
);

// Component to display a single digit, used for Stage 3 carry and sum input boxes
const DigitDisplayBox = ({
  digit,
  isUserInputCarry = false,
  isEmptyPlaceholder = false,
}: {
  digit?: string | number;
  isUserInputCarry?: boolean;
  isEmptyPlaceholder?: boolean;
}) => {
  let effectiveDigit = digit !== undefined ? String(digit) : '';
  if (isEmptyPlaceholder && effectiveDigit === '') effectiveDigit = '';

  return (
    <div className={cn(
      "w-10 h-10 border-2 rounded-md flex items-center justify-center text-2xl font-mono",
      isUserInputCarry
        ? "border-red-500 bg-red-50 text-red-700"
        : isEmptyPlaceholder && effectiveDigit === ''
            ? "border-dashed border-muted-foreground/50"
            : "border-muted-foreground bg-background/50 text-primary",
       effectiveDigit === '' && !isUserInputCarry && !isEmptyPlaceholder && "text-transparent",
    )}>
      {effectiveDigit || (isUserInputCarry || isEmptyPlaceholder ? '' : '\u00A0')}
    </div>
  );
};

// Component to display problem numbers (num1, num2) with padding for column alignment
const PaddedNumber = ({ num }: { num: number}) => {
  const strNum = String(num);
  // For a single digit number like 3, tens should be empty, ones should be '3'
  // For a two digit number like 12, tens is '1', ones is '2'
  const onesDisplay = strNum.slice(-1);
  const tensDisplay = strNum.length > 1 ? strNum.slice(-2, -1) : '\u00A0'; // Non-breaking space for empty tens

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

  // Calculate line width for Stage 3 based on two digit boxes and their gap
  const stage3LineWidth = "calc(2 * theme(spacing.10) + theme(spacing.1))"; // 2 * w-10 + gap-x-1

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
          {/* Carry Row: Box appears after sumOnes is entered */}
          <div className="grid grid-cols-2 gap-x-1 w-auto min-h-[2.5rem] mb-0.5"> {/* Matches PaddedNumber structure */}
            <div className="flex justify-center items-center"> {/* Tens column for carry */}
              {stage3Inputs.sumOnes !== '' && ( // Only show carry box if sumOnes is filled
                <DigitDisplayBox
                  digit={stage3Inputs.carry}
                  isUserInputCarry={true}
                />
              )}
            </div>
            <div className="w-10"></div> {/* Empty spacer for ones column in carry row, always present for alignment */}
          </div>

          {/* Num1 Row */}
          <PaddedNumber num={problem.num1} />

          {/* Operator + Num2 Row */}
          <div className="flex justify-end items-center w-full mt-1">
            <span className="operator text-primary mr-1 sm:mr-2 self-center">+</span>
            <PaddedNumber num={problem.num2} />
          </div>

          {/* Line */}
          <div className="line-container flex justify-end w-full">
            <div
              className="line bg-foreground my-1 sm:my-2 h-[2px]"
              style={{ width: stage3LineWidth }}
            ></div>
          </div>

          {/* Result Row */}
          <div className="grid grid-cols-2 gap-x-1 w-auto">
            <DigitDisplayBox digit={stage3Inputs.sumTens} isEmptyPlaceholder={true} />
            <DigitDisplayBox digit={stage3Inputs.sumOnes} isEmptyPlaceholder={true} />
          </div>
        </div>
      )}
    </div>
  );
}
