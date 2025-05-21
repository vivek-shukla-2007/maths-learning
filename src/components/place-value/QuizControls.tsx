
"use client";

import type * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizControlsProps {
  options: number[];
  onAnswerSelect: (answer: number) => void;
  onShowHint: () => void;
  isAnswered: boolean; // True if gameStage is "answered" (correct answer given, before auto-advance)
  selectedAnswer: number | null;
  correctAnswer: number | null;
  className?: string;
}

export function QuizControls({
  options,
  onAnswerSelect,
  onShowHint,
  isAnswered, 
  selectedAnswer,
  correctAnswer,
  className,
}: QuizControlsProps): React.JSX.Element {
  
  const getButtonVariant = (option: number) => {
    if (selectedAnswer === null) return "outline"; 
    // If an answer is selected (correct or incorrect)
    if (selectedAnswer === option) {
      return option === correctAnswer ? "default" : "destructive"; // Green if correct, Red if incorrect
    }
    return "outline"; // Default for other unselected options
  };

  const getButtonIcon = (option: number) => {
    if (selectedAnswer === null) return null;
    if (selectedAnswer === option) {
      return option === correctAnswer ? <CheckCircle2 className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />;
    }
    return null;
  };

  return (
    <Card className={cn("w-full max-w-md shadow-lg", className)}>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => (
            <Button
              key={option}
              variant={getButtonVariant(option)}
              size="lg"
              className="text-lg h-16"
              onClick={() => onAnswerSelect(option)}
              // Buttons are disabled if the question has been correctly answered and awaiting auto-advance
              disabled={isAnswered && selectedAnswer === correctAnswer} 
            >
              {getButtonIcon(option)}
              {option}
            </Button>
          ))}
        </div>
        
        <div className="flex justify-center items-center pt-2"> {/* Centered hint button */}
          <Button 
            variant="ghost" 
            onClick={onShowHint} 
            disabled={isAnswered && selectedAnswer === correctAnswer} // Disable hint if question is correctly answered
            className="text-accent-foreground hover:text-accent"
          >
            <Lightbulb className="mr-2 h-5 w-5" /> Hint
          </Button>
          {/* "Next Question" button removed as progression is automatic */}
        </div>
      </CardContent>
    </Card>
  );
}
