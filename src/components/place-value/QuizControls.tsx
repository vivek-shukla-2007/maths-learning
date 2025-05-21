
"use client";

import type * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface QuizControlsProps {
  options: number[];
  onAnswerSelect: (answer: number) => void;
  onShowHint: () => void;
  onNextQuestion: () => void;
  feedback: string;
  isAnswered: boolean;
  selectedAnswer: number | null;
  correctAnswer: number | null;
}

export function QuizControls({
  options,
  onAnswerSelect,
  onShowHint,
  onNextQuestion,
  feedback,
  isAnswered,
  selectedAnswer,
  correctAnswer,
}: QuizControlsProps): React.JSX.Element {
  
  const getButtonVariant = (option: number) => {
    if (!isAnswered) return "outline";
    if (option === correctAnswer) return "default";
    if (option === selectedAnswer && option !== correctAnswer) return "destructive";
    return "outline";
  };

  const getButtonIcon = (option: number) => {
    if (!isAnswered) return null;
    if (option === correctAnswer) return <CheckCircle2 className="mr-2 h-5 w-5" />;
    if (option === selectedAnswer && option !== correctAnswer) return <XCircle className="mr-2 h-5 w-5" />;
    return null;
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardContent className="p-6 space-y-4">
        {/* Removed "What number do the blocks show?" text from here */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => (
            <Button
              key={option}
              variant={getButtonVariant(option)}
              size="lg"
              className="text-lg h-16"
              onClick={() => onAnswerSelect(option)}
              disabled={isAnswered}
            >
              {getButtonIcon(option)}
              {option}
            </Button>
          ))}
        </div>
        
        {feedback && (
          <div className={`text-center p-3 rounded-md text-md font-medium ${
              feedback.toLowerCase().startsWith("correct") ? 'bg-green-100 text-green-700' : 
              feedback.toLowerCase().startsWith("oops") ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
            {feedback}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" onClick={onShowHint} disabled={isAnswered} className="text-accent-foreground hover:text-accent">
            <Lightbulb className="mr-2 h-5 w-5" /> Hint
          </Button>
          {isAnswered && (
            <Button onClick={onNextQuestion} size="lg" className="bg-primary hover:bg-primary/90">
              Next Question <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
