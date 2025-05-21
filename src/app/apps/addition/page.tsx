
"use client";

import type * as React from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreDisplay } from '@/components/place-value/ScoreDisplay'; // Re-using for now
// import { AITutorDialog } from '@/components/place-value/AITutorDialog'; // Re-using for now
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListRestart, ThumbsUp, XCircle, LayoutGrid, Star, Minus, Plus } from 'lucide-react';
import { ADDITION_STAGES, QUESTIONS_PER_BATCH } from '@/lib/constants';
import { StageSelector } from '@/components/addition/StageSelector';
import { ProblemDisplay } from '@/components/addition/ProblemDisplay';
import { AnswerOptions } from '@/components/addition/AnswerOptions';

// Placeholder for AI flow if we adapt one later
// import { adaptiveTutoring, type AdaptiveTutoringInput } from '@/ai/flows/adaptive-tutoring';


type GameView = "stageSelection" | "playing" | "answered" | "evaluatingAI" | "aiFeedback";
type FeedbackAnimation = { type: 'correct' | 'incorrect', key: number } | null;

interface AdditionProblem {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
  type: 'addition'; // Could expand to subtraction later
}

export default function AdditionAdventurePage(): React.JSX.Element {
  const [gameView, setGameView] = useState<GameView>("stageSelection");
  const [currentStageId, setCurrentStageId] = useState<string>(ADDITION_STAGES[0].id);

  const [currentProblem, setCurrentProblem] = useState<AdditionProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [score, setScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });

  // const [aiTutorExplanation, setAiTutorExplanation] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const [feedbackAnimation, setFeedbackAnimation] = useState<FeedbackAnimation>(null);

  const { toast } = useToast();

  const generateProblemOptions = useCallback((correctNum: number, maxNumInRange: number): number[] => {
    const incorrectOptions = new Set<number>();
    // Ensure options are somewhat close or within a reasonable range for addition
    const rangeForOptions = Math.max(10, correctNum + 5);

    while (incorrectOptions.size < 3) {
      let potentialOption;
      const offsetDirection = Math.random() < 0.5 ? -1 : 1;
      const smallOffset = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
      const largerOffset = Math.floor(Math.random() * 5) + 1; // 1 to 5

      if (Math.random() < 0.7) { // 70% chance for closer options
        potentialOption = correctNum + (offsetDirection * smallOffset);
      } else { // 30% chance for slightly wider options or completely random within range
        if (Math.random() < 0.5) {
            potentialOption = correctNum + (offsetDirection * largerOffset);
        } else {
            potentialOption = Math.floor(Math.random() * (maxNumInRange + 1)); // 0 to maxNumInRange
        }
      }
      
      // Ensure option is valid and not the correct answer
      if (potentialOption !== correctNum && potentialOption >= 0 && potentialOption <= maxNumInRange + 5) { // Allow slightly above max range for variety
        incorrectOptions.add(potentialOption);
      }
    }
    const allOptions = [correctNum, ...Array.from(incorrectOptions)];
    return allOptions.sort(() => Math.random() - 0.5);
  }, []);


  const generateNewProblem = useCallback((stageId: string) => {
    const stage = ADDITION_STAGES.find(s => s.id === stageId);
    if (!stage) return;

    let num1 = 0;
    let num2 = 0;

    if (stage.id === 'add-visual') {
      num1 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
      num2 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
       // Ensure sum is not too large for very young learners, e.g., sum <= 10 for visual stage.
      while (num1 + num2 > 10) { // Adjust if necessary for very early visual stage
        num1 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
        num2 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
      }
    } else if (stage.id === 'add-numbers') {
      num1 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
      num2 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
      // Rule: If one number is 10, the other can be max 9. Max operand is 10.
      if (num1 === 10) {
        num2 = Math.floor(Math.random() * 10); // 0-9
      } else if (num2 === 10) {
        num1 = Math.floor(Math.random() * 10); // 0-9
      }
      // Ensure sum is max 19
       while (num1 + num2 > 19) {
        num1 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
        num2 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
        if (num1 === 10) num2 = Math.floor(Math.random() * 10);
        else if (num2 === 10) num1 = Math.floor(Math.random() * 10);
       }

    } else if (stage.id === 'add-carry') {
       // Ensure one number might cause a carry, or both are single digit summing > 9, or one 2-digit.
       // Example: 6+5, 8+7, 13+4, 8+15
       // Max sum around 30-40 for simplicity for now.
       const typeOfProblem = Math.random();
       if (typeOfProblem < 0.4) { // Two single digits that carry
           num1 = Math.floor(Math.random() * 5) + 5; // 5-9
           num2 = Math.floor(Math.random() * (10 - num1)) + (10 - num1); // Ensure sum is >= 10, e.g. if num1 is 5, num2 is 5-9
           if (num1 + num2 < 10) num2 = 10 - num1 + Math.floor(Math.random()* (9 - (10-num1) +1)); // ensure sum is at least 10
       } else if (typeOfProblem < 0.8) { // One 2-digit, one 1-digit
           num1 = Math.floor(Math.random() * 11) + 10; // 10-20
           num2 = Math.floor(Math.random() * 9) + 1;   // 1-9
       } else { // Two 1-digit numbers that don't necessarily carry (for variety)
           num1 = Math.floor(Math.random() * 9) + 1; // 1-9
           num2 = Math.floor(Math.random() * 9) + 1; // 1-9
       }
       if (Math.random() > 0.5) [num1, num2] = [num2, num1]; // Swap sometimes
    }


    const correctAnswer = num1 + num2;
    const maxPossibleSum = stage.id === 'add-visual' ? 10 : (stage.id === 'add-numbers' ? 19 : 39); // Estimate for option generation range
    const options = generateProblemOptions(correctAnswer, maxPossibleSum);

    setCurrentProblem({ num1, num2, correctAnswer, options, type: 'addition' });
    setSelectedAnswer(null);
    setGameView("playing");
  }, [generateProblemOptions]);

  const handleStageSelect = (stageId: string) => {
    setCurrentStageId(stageId);
    setScore({ correct: 0, total: 0 });
    generateNewProblem(stageId);
  };

  const handleGameMenu = () => {
    setGameView("stageSelection");
    setScore({ correct: 0, total: 0 });
    setCurrentProblem(null);
  };

  const proceedToNextStep = useCallback(() => {
    // For now, AI evaluation is disabled, can be re-added later
    // if (score.total > 0 && (score.total % QUESTIONS_PER_BATCH === 0)) {
    //    setGameView("evaluatingAI");
    // } else {
      generateNewProblem(currentStageId);
    // }
  }, [score.total, currentStageId, generateNewProblem]);

  const handleAnswerSelect = (answer: number) => {
    if (!currentProblem) return;
    setSelectedAnswer(answer);

    if (answer === currentProblem.correctAnswer) {
      setScore(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1
      }));
      setFeedbackAnimation({ type: 'correct', key: Date.now() });
      setGameView("answered");
      setTimeout(() => {
        proceedToNextStep();
        setFeedbackAnimation(null);
      }, 1200);
    } else {
      setFeedbackAnimation({ type: 'incorrect', key: Date.now() });
      // Score total does not increment on wrong answer first try
       setTimeout(() => {
        setFeedbackAnimation(null);
        // User stays on the same question, selectedAnswer remains the incorrect one
        // The UI in AnswerOptions will show it as destructive
      }, 1200);
    }
  };

  const handleShowHint = () => {
    if (!currentProblem) return;
    const stage = ADDITION_STAGES.find(s => s.id === currentStageId);
    let hintDescription = "Try counting carefully!";
    if (stage?.id === 'add-visual') {
      hintDescription = `Count the first group of stars and then the second group.`;
    } else if (stage?.id === 'add-numbers') {
      hintDescription = `What is ${currentProblem.num1} plus ${currentProblem.num2}?`;
    } else if (stage?.id === 'add-carry') {
       hintDescription = `Add the ones column first. Remember to carry over if the sum is 10 or more. Then add the tens column.`;
    }

    toast({
      title: "Hint!",
      description: hintDescription,
      duration: 3000,
    });
  };

  // AI Tutor useEffect - Placeholder for now
  // useEffect(() => {
  //   if (gameView === "evaluatingAI") {
  //     // AI logic would go here
  //     // For now, just proceed to next question
  //     setIsLoadingAI(false); // Simulate AI finishing
  //     setGameView("playing"); // Or aiFeedback
  //     generateNewProblem(currentStageId);
  //   }
  // }, [gameView, currentStageId, score, toast, generateNewProblem]);

  // const handleAIClose = () => { // Placeholder
  //   generateNewProblem(currentStageId);
  // };

  useEffect(() => {
    document.title = 'Addition Adventure';
  }, []);

  if (isLoadingAI) { // Placeholder
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">AI Tutor is thinking...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6 py-6 relative">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 px-2">
        <div className="flex-1">
          {gameView !== "stageSelection" && currentProblem && (
            <ScoreDisplay correct={score.correct} total={score.total} />
          )}
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {gameView !== "stageSelection" && currentProblem && (
            <Button variant="outline" size="icon" onClick={handleGameMenu} className="shadow-md" aria-label="Game Menu">
              <ListRestart className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" passHref>
            <Button variant="secondary" size="icon" className="shadow-md" aria-label="All Apps">
              <LayoutGrid className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {gameView === "stageSelection" && (
        <StageSelector
          stages={ADDITION_STAGES}
          onStageSelect={handleStageSelect}
          disabled={isLoadingAI /* || gameView === "evaluatingAI" */}
        />
      )}

      {(gameView === "playing" || gameView === "answered") && currentProblem && (
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-start mt-2"> {/* Changed to items-start */}
          <Card className="shadow-xl flex flex-col min-h-[300px] md:min-h-[400px]"> {/* Added min-height */}
            <CardHeader>
              <CardTitle className="text-3xl text-center text-primary">
                Solve!
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <ProblemDisplay
                problem={currentProblem}
                stageId={currentStageId}
              />
            </CardContent>
          </Card>
          <div className="flex flex-col h-full pt-2 md:pt-0">
            {currentProblem.options.length > 0 && (
                <AnswerOptions
                    options={currentProblem.options}
                    onAnswerSelect={handleAnswerSelect}
                    onShowHint={handleShowHint}
                    isAnswered={gameView === "answered" || (selectedAnswer !== null && selectedAnswer !== currentProblem.correctAnswer) }
                    selectedAnswer={selectedAnswer}
                    correctAnswer={currentProblem.correctAnswer}
                    className="mt-auto"
                    disabled={gameView === "answered" && selectedAnswer === currentProblem.correctAnswer}
                />
            )}
          </div>
        </div>
      )}

      {feedbackAnimation && (
        <div
          key={feedbackAnimation.key}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className={`p-8 rounded-full shadow-2xl
            ${feedbackAnimation.type === 'correct' ? 'bg-green-500/80' : 'bg-red-500/80'}
            animate-scale-up-pop`}
          >
            {feedbackAnimation.type === 'correct' ? (
              <ThumbsUp className="h-24 w-24 text-white" />
            ) : (
              <XCircle className="h-24 w-24 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Placeholder for AI Tutor Dialog if used later */}
      {/* <AITutorDialog
        isOpen={gameView === "aiFeedback"}
        onClose={handleAIClose}
        explanation={aiTutorExplanation}
        newLevel={currentProblem?.num1 || 0} // Needs adjustment if AI tutor is used
      /> */}
    </div>
  );
}
