
"use client";

import type * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizControlsProps {
  options: number[];
  onAnswerSelect: (answer: number) => void;
  onShowHint: () => void;
  onNextQuestion: () => void;
  isAnswered: boolean; // True only if gameStage is "answered" (i.e., correct answer given)
  selectedAnswer: number | null;
  correctAnswer: number | null;
  className?: string;
}

export function QuizControls({
  options,
  onAnswerSelect,
  onShowHint,
  onNextQuestion,
  isAnswered, // This now strictly means the question was answered *correctly*
  selectedAnswer,
  correctAnswer,
  className,
}: QuizControlsProps): React.JSX.Element {
  
  const getButtonVariant = (option: number) => {
    if (selectedAnswer === null) return "outline"; // No answer selected yet
    if (isAnswered && option === correctAnswer) return "default"; // Correct answer submitted and stage is "answered"
    if (selectedAnswer === option && option !== correctAnswer) return "destructive"; // Incorrect answer selected
    if (selectedAnswer === option && option === correctAnswer && !isAnswered) return "outline"; // Correct option clicked, but not yet "answered" stage (should not happen with current logic)
    return "outline"; // Default for other options
  };

  const getButtonIcon = (option: number) => {
    if (selectedAnswer === null) return null;
    if (isAnswered && option === correctAnswer) return <CheckCircle2 className="mr-2 h-5 w-5" />;
    if (selectedAnswer === option && option !== correctAnswer) return <XCircle className="mr-2 h-5 w-5" />;
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
              // Buttons are disabled only if the question has been correctly answered and awaiting "Next"
              disabled={isAnswered} 
            >
              {getButtonIcon(option)}
              {option}
            </Button>
          ))}
        </div>
        
        {/* Feedback text display removed as per user request */}

        <div className="flex justify-between items-center pt-2">
          <Button 
            variant="ghost" 
            onClick={onShowHint} 
            disabled={isAnswered} // Disable hint if question is correctly answered
            className="text-accent-foreground hover:text-accent"
          >
            <Lightbulb className="mr-2 h-5 w-5" /> Hint
          </Button>
          {isAnswered && ( // "Next Question" button only appears if isAnswered is true (correct answer given)
            <Button onClick={onNextQuestion} size="lg" className="bg-primary hover:bg-primary/90">
              Next Question <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
