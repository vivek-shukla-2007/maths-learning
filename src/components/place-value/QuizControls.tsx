
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
  isAnswered: boolean; 
  selectedAnswer: number | null;
  correctAnswer: number | null;
  className?: string;
  disabled?: boolean; // New prop to disable all controls
}

export function QuizControls({
  options,
  onAnswerSelect,
  onShowHint,
  isAnswered, 
  selectedAnswer,
  correctAnswer,
  className,
  disabled = false, // Default to false
}: QuizControlsProps): React.JSX.Element {
  
  const getButtonVariant = (option: number) => {
    if (selectedAnswer === null) return "outline"; 
    if (selectedAnswer === option) {
      return option === correctAnswer ? "default" : "destructive";
    }
    return "outline"; 
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
              disabled={disabled || (isAnswered && selectedAnswer === correctAnswer && option === correctAnswer)} // Disable if overall disabled or if it's the correctly answered button
            >
              {getButtonIcon(option)}
              {option}
            </Button>
          ))}
        </div>
        
        <div className="flex justify-center items-center pt-2">
          <Button 
            variant="ghost" 
            onClick={onShowHint} 
            disabled={disabled || (isAnswered && selectedAnswer === correctAnswer)}
            className="text-accent-foreground hover:text-accent"
          >
            <Lightbulb className="mr-2 h-5 w-5" /> Hint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
