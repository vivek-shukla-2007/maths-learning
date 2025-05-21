
"use client";

import type * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerOptionsProps {
  options: number[];
  onAnswerSelect: (answer: number) => void;
  onShowHint: () => void;
  isAnswered: boolean; 
  selectedAnswer: number | null;
  correctAnswer: number | null;
  className?: string;
  disabled?: boolean;
  stageId?: string; 
}

export function AnswerOptions({
  options,
  onAnswerSelect,
  onShowHint,
  isAnswered, 
  selectedAnswer,
  correctAnswer,
  className,
  disabled = false,
  stageId,
}: AnswerOptionsProps): React.JSX.Element {
  
  const getButtonVariant = (option: number) => {
    if (!isAnswered && selectedAnswer === option) return "secondary"; 
    if (isAnswered && selectedAnswer === option) {
      return option === correctAnswer ? "default" : "destructive";
    }
    return "outline"; 
  };

  const getButtonIcon = (option: number) => {
    if (isAnswered && selectedAnswer === option) {
      return option === correctAnswer ? <CheckCircle2 className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />;
    }
    return null;
  };

  const showHintButton = stageId !== 'sub-visual'; // No hint for visual stage initially

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
              disabled={disabled || (isAnswered && selectedAnswer === correctAnswer)} 
            >
              {getButtonIcon(option)}
              {option}
            </Button>
          ))}
        </div>
        
        {showHintButton && (
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
        )}
      </CardContent>
    </Card>
  );
}
