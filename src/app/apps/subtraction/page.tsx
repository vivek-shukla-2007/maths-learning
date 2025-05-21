
"use client";

import type * as React from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreDisplay } from '@/components/place-value/ScoreDisplay'; // Reusing for score
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListRestart, ThumbsUp, XCircle, LayoutGrid } from 'lucide-react';
import { SUBTRACTION_STAGES } from '@/lib/constants';
import { StageSelector } from '@/components/subtraction/StageSelector';
import { ProblemDisplay } from '@/components/subtraction/ProblemDisplay';
import { AnswerOptions } from '@/components/subtraction/AnswerOptions';
import { NumpadInput } from '@/components/subtraction/NumpadInput'; // For Stage 3

type GameView = "stageSelection" | "playing" | "answered" | "evaluatingAI" | "aiFeedback"; // eval/feedback for future AI
type FeedbackAnimation = { type: 'correct' | 'incorrect', key: number } | null;

interface SubtractionProblem {
  minuend: number;
  subtrahend: number;
  correctAnswer: number;
  options: number[];
  // For Stage 3:
  actualIsBorrowingNeeded?: boolean; 
  // We might add more fields for Stage 3 visualization later like:
  // visuallyAdjustedMinuendTens?: number;
  // visuallyAdjustedMinuendOnes?: number;
}

interface Stage3Inputs { // For column subtraction user input
  // borrowedVisual: string; // User doesn't input this directly, system might show it.
  diffTens: string;
  diffOnes: string;
}

const initialStage3Inputs: Stage3Inputs = { diffTens: '', diffOnes: '' };

export default function SubtractionSprintsPage(): React.JSX.Element {
  const [gameView, setGameView] = useState<GameView>("stageSelection");
  const [currentStageId, setCurrentStageId] = useState<string>(SUBTRACTION_STAGES[0].id);

  const [currentProblem, setCurrentProblem] = useState<SubtractionProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // For stages 1 & 2
  const [stage3Inputs, setStage3Inputs] = useState<Stage3Inputs>(initialStage3Inputs);

  const [score, setScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });

  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false); // Placeholder
  const [feedbackAnimation, setFeedbackAnimation] = useState<FeedbackAnimation>(null);
  const { toast } = useToast();

  const generateProblemOptions = useCallback((correctNum: number, maxNumInRange: number): number[] => {
    const incorrectOptions = new Set<number>();
    // Ensure options are reasonable and don't go below 0 for subtraction
    while (incorrectOptions.size < 3) {
      let potentialOption;
      const offset = Math.floor(Math.random() * 5) + 1; // Bias towards smaller offsets
      if (Math.random() < 0.5) {
        potentialOption = correctNum + offset;
      } else {
        potentialOption = correctNum - offset;
      }
      
      if (potentialOption !== correctNum && potentialOption >= 0 && potentialOption <= maxNumInRange + 5) {
        incorrectOptions.add(potentialOption);
      } else { // Fallback if too many attempts fail to find good offsets
          let fallback = Math.floor(Math.random() * (maxNumInRange + 1));
          if (fallback !== correctNum && fallback >= 0) incorrectOptions.add(fallback);
      }
    }
    const allOptions = [correctNum, ...Array.from(incorrectOptions)];
    return allOptions.sort(() => Math.random() - 0.5);
  }, []);

  const generateNewProblem = useCallback((stageId: string) => {
    const stage = SUBTRACTION_STAGES.find(s => s.id === stageId);
    if (!stage) return;

    let minuend = 0;
    let subtrahend = 0;
    let actualIsBorrowingNeeded = false;

    if (stage.id === 'sub-visual' || stage.id === 'sub-numbers') {
      minuend = Math.floor(Math.random() * (stage.maxMinuend - 1)) + 1; // Minuend at least 1
      subtrahend = Math.floor(Math.random() * minuend); // Subtrahend is 0 to minuend-1, so result always >=0
       if (minuend === subtrahend && minuend > 0) { // Avoid M - M = 0 too often for small numbers
           subtrahend = Math.max(0, subtrahend -1);
       } else if (minuend === 0) { // Should not happen with minuend >=1
           minuend = 1; subtrahend = 0;
       }

    } else if (stage.id === 'sub-borrow') {
      // Generate two 2-digit numbers where borrowing is required.
      // Minuend: 10-99, Subtrahend: 10-98 (and < minuend)
      // Ensure ones_minuend < ones_subtrahend
      do {
        minuend = Math.floor(Math.random() * 90) + 10; // 10-99
        subtrahend = Math.floor(Math.random() * (minuend - 10)) + 10; // Ensure subtrahend is smaller and >= 10 to make borrowing meaningful
        
        const onesMinuend = minuend % 10;
        const onesSubtrahend = subtrahend % 10;
        
        actualIsBorrowingNeeded = onesMinuend < onesSubtrahend;

      } while (!actualIsBorrowingNeeded || minuend - subtrahend < 0); // Ensure borrowing is needed and result isn't negative
    }

    const correctAnswer = minuend - subtrahend;
    const options = (stage.id !== 'sub-borrow') ? generateProblemOptions(correctAnswer, stage.maxMinuend) : [];

    setCurrentProblem({ minuend, subtrahend, correctAnswer, options, actualIsBorrowingNeeded });
    setSelectedAnswer(null);
    setStage3Inputs(initialStage3Inputs);
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

  const proceedToNextProblem = useCallback(() => {
    generateNewProblem(currentStageId);
  }, [currentStageId, generateNewProblem]);

  const handleAnswerSubmission = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1
      }));
      setFeedbackAnimation({ type: 'correct', key: Date.now() });
      setGameView("answered"); 
      setTimeout(() => {
        proceedToNextProblem();
        setFeedbackAnimation(null);
      }, 1200);
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1})); 
      setFeedbackAnimation({ type: 'incorrect', key: Date.now() });
      setTimeout(() => {
        setFeedbackAnimation(null);
        if (currentStageId === 'sub-borrow') {
          // For stage 3, allow re-input, but don't clear immediately.
          setGameView("playing"); 
        }
      }, 1200);
    }
  };

  const handleStage1Or2AnswerSelect = (answer: number) => {
    if (!currentProblem) return;
    setSelectedAnswer(answer);
    handleAnswerSubmission(answer === currentProblem.correctAnswer);
  };
  
  // Stage 3 Input Handlers (Placeholder - to be developed in next iteration)
  const handleStage3DigitPress = (digit: string) => {
    // Logic to fill diffOnes, then diffTens
    // This will be more complex with borrowing visualization
    setStage3Inputs(prev => {
        if (prev.diffOnes === '') return { ...prev, diffOnes: digit };
        if (prev.diffTens === '') return { ...prev, diffTens: digit };
        return prev;
    });
  };

  const handleStage3ClearPress = () => {
    setStage3Inputs(initialStage3Inputs);
  };

  const handleStage3SubmitPress = () => {
    if (!currentProblem) return;
    
    const { diffTens, diffOnes } = stage3Inputs;

    if (diffOnes === '' || diffTens === '') {
        toast({ title: "Missing Input", description: "Please fill all answer boxes.", variant: "destructive", duration: 2000 });
        return;
    }
    
    const enteredDifference = parseInt(diffTens + diffOnes, 10);
    handleAnswerSubmission(enteredDifference === currentProblem.correctAnswer);
  };


  const handleShowHint = () => {
    if (!currentProblem) return;
    const stage = SUBTRACTION_STAGES.find(s => s.id === currentStageId);
    let hintDescription = "Try counting carefully!";

    if (stage?.id === 'sub-visual') { 
        hintDescription = `What is ${currentProblem.minuend} take away ${currentProblem.subtrahend}?`;
    } else if (stage?.id === 'sub-numbers') {
      hintDescription = `What is ${currentProblem.minuend} minus ${currentProblem.subtrahend}?`;
    } else if (stage?.id === 'sub-borrow') {
       // More detailed hint needed here based on borrowing logic
       hintDescription = `Subtract the ones column. If you need to borrow, adjust the tens place of the top number. Then subtract the tens column.`;
        if (currentProblem.actualIsBorrowingNeeded) {
            hintDescription += ` Remember, for this problem, you will need to borrow from the tens place.`;
        }
    }

    toast({
      title: "Hint!",
      description: hintDescription,
      duration: stage?.id === 'sub-borrow' ? 4000 : 3000,
    });
  };

  useEffect(() => {
    document.title = 'Subtraction Sprints';
  }, []);

  if (isLoadingAI) { // Placeholder for future AI tutor
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
          stages={SUBTRACTION_STAGES}
          onStageSelect={handleStageSelect}
          disabled={isLoadingAI}
        />
      )}

      {(gameView === "playing" || gameView === "answered") && currentProblem && (
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-start mt-2">
          <Card className="shadow-xl flex flex-col min-h-[300px] md:min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-primary">
                Solve!
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <ProblemDisplay
                problem={currentProblem}
                stageId={currentStageId}
                stage3Inputs={currentStageId === 'sub-borrow' ? stage3Inputs : undefined}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col h-full pt-2 md:pt-0">
            {currentStageId !== 'sub-borrow' && currentProblem.options.length > 0 && (
                <AnswerOptions
                    options={currentProblem.options}
                    onAnswerSelect={handleStage1Or2AnswerSelect}
                    onShowHint={handleShowHint}
                    isAnswered={gameView === "answered"}
                    selectedAnswer={selectedAnswer}
                    correctAnswer={currentProblem.correctAnswer}
                    className="mt-auto"
                    disabled={(gameView === "answered" && selectedAnswer === currentProblem.correctAnswer) || gameView === "evaluatingAI"}
                    stageId={currentStageId}
                />
            )}
            {currentStageId === 'sub-borrow' && (
              <NumpadInput
                onDigitPress={handleStage3DigitPress}
                onClearPress={handleStage3ClearPress}
                onSubmitPress={handleStage3SubmitPress}
                onShowHint={handleShowHint}
                disabled={(gameView === "answered" && stage3Inputs.diffTens !== '' && stage3Inputs.diffOnes !== '' && parseInt(stage3Inputs.diffTens + stage3Inputs.diffOnes) === currentProblem.correctAnswer) || gameView === "evaluatingAI"}
                className="mt-auto"
                showHintButton={true}
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
    </div>
  );
}
