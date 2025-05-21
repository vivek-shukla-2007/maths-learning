
"use client";

import type * as React from 'react';
import { Star, Plus } from 'lucide-react';
import { cn } from "@/lib/utils"; // Added missing import

interface AdditionProblem {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
  type: 'addition' | 'subtraction';
}

interface ProblemDisplayProps {
  problem: AdditionProblem | null;
  stageId: string;
  stage3AnswerDigits?: [string, string]; // For Stage 3 interactive input
}

const MAX_STARS_PER_ROW = 5;

const AnswerBox = () => (
  <div className="answer-box-visual">
    {/* Content will be empty, representing a blank box. Styling handles the box appearance. */}
  </div>
);

// Renamed from CarryAnswerBox to be more generic for answer digit display
const DigitDisplayBox = ({ digit, isCarryPlaceholder = false }: { digit?: string | number, isCarryPlaceholder?: boolean }) => (
  <div className={cn(
    "w-10 h-10 border rounded-md flex items-center justify-center text-2xl font-mono",
    isCarryPlaceholder ? "border-red-500 bg-red-100/50 text-red-700" : "border-muted-foreground bg-background/50 text-primary"
  )}>
    {digit !== undefined ? digit : ''}
  </div>
);


const PaddedNumber = ({ num }: { num: number}) => {
  const strNum = num.toString();
  const tens = strNum.length > 1 ? strNum[strNum.length - 2] : '\u00A0'; // Use non-breaking space for alignment
  const ones = strNum[strNum.length - 1];
  
  return (
    <div className="grid grid-cols-2 gap-1 text-right">
      <span>{tens}</span>
      <span>{ones}</span>
    </div>
  );
};


export function ProblemDisplay({ problem, stageId, stage3AnswerDigits = ['', ''] }: ProblemDisplayProps): React.JSX.Element {
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
          <div className="carry-row">
            {/* Visual cue for carry, not interactive for now */}
            <DigitDisplayBox isCarryPlaceholder={true} /> 
            <div className="w-10 h-10"></div> {/* Spacer for ones column */}
          </div>
          <div className="operand-row justify-end">
            <PaddedNumber num={problem.num1} />
          </div>
          <div className="operator-operand-row flex justify-between items-center">
            <span className="operator text-primary mr-2 sm:mr-4">+</span>
            <PaddedNumber num={problem.num2} />
          </div>
          <div className="line bg-foreground my-1 sm:my-2"></div>
          <div className="result-row justify-end">
            <div className="grid grid-cols-2 gap-1 text-right">
              <DigitDisplayBox digit={stage3AnswerDigits[0]} /> 
              <DigitDisplayBox digit={stage3AnswerDigits[1]} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
