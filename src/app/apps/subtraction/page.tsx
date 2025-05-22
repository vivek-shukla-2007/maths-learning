
"use client";

import type * as React from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreDisplay } from '@/components/place-value/ScoreDisplay'; 
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListRestart, ThumbsUp, XCircle, LayoutGrid } from 'lucide-react';
import { SUBTRACTION_STAGES } from '@/lib/constants';
import { StageSelector } from '@/components/subtraction/StageSelector';
import { ProblemDisplay } from '@/components/subtraction/ProblemDisplay';
import { AnswerOptions } from '@/components/subtraction/AnswerOptions';
import { NumpadInput } from '@/components/subtraction/NumpadInput';

type GameView = "stageSelection" | "playing" | "answered" | "evaluatingAI" | "aiFeedback";
type FeedbackAnimation = { type: 'correct' | 'incorrect', key: number } | null;

interface SubtractionProblem {
  minuend: number;
  subtrahend: number;
  correctAnswer: number;
  options: number[];
  actualIsBorrowingNeeded?: boolean; 
}

interface Stage3Inputs {
  diffTens: string;
  diffOnes: string;
}

const initialStage3Inputs: Stage3Inputs = { diffTens: '', diffOnes: '' };

export default function SubtractionSprintsPage(): React.JSX.Element {
  const [gameView, setGameView] = useState<GameView>("stageSelection");
  const [currentStageId, setCurrentStageId] = useState<string>(SUBTRACTION_STAGES[0].id);

  const [currentProblem, setCurrentProblem] = useState<SubtractionProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [stage3Inputs, setStage3Inputs] = useState<Stage3Inputs>(initialStage3Inputs);

  const [score, setScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });

  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false); 
  const [feedbackAnimation, setFeedbackAnimation] = useState<FeedbackAnimation>(null);
  const { toast } = useToast();

  const generateProblemOptions = useCallback((correctNum: number, maxNumInRange: number): number[] => {
    const incorrectOptions = new Set<number>();
    const rangeForOptions = Math.max(10, correctNum + 5); 
    
    while (incorrectOptions.size < 3) {
      let potentialOption;
      const offsetDirection = Math.random() < 0.5 ? -1 : 1;
      const smallOffset = Math.floor(Math.random() * 3) + 1; 
      const largerOffset = Math.floor(Math.random() * 5) + 1; 
      
      if (Math.random() < 0.7) { 
        potentialOption = correctNum + (offsetDirection * smallOffset);
      } else { 
        if (Math.random() < 0.5) {
            potentialOption = correctNum + (offsetDirection * largerOffset);
        } else {
            potentialOption = Math.floor(Math.random() * (Math.min(maxNumInRange, correctNum + 10) + 1));
        }
      }
      
      if (potentialOption !== correctNum && potentialOption >= 0 && potentialOption <= maxNumInRange + 5) {
        incorrectOptions.add(potentialOption);
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
      minuend = Math.floor(Math.random() * (stage.maxMinuend -1)) + 1; 
      if (stage.id === 'sub-numbers' && minuend > 10) minuend = 10; // Cap for stage 2
      
      subtrahend = Math.floor(Math.random() * (minuend + 1)); 
      if (minuend === subtrahend && minuend > 0 && stage.id === 'sub-visual') { 
           subtrahend = Math.max(0, subtrahend -1); 
       } else if (minuend === 0) { 
           minuend = 1; subtrahend = 0; 
       }
    } else if (stage.id === 'sub-borrow') {
      let onesMinuend = 0, onesSubtrahend = 0;
      let tensMinuend = 0, tensSubtrahend = 0;
      do {
        minuend = Math.floor(Math.random() * 89) + 11; // Minuend 11-99
        subtrahend = Math.floor(Math.random() * (minuend - 10)) + 10; 
        
        if (subtrahend >= minuend) subtrahend = minuend -1; 
        if (subtrahend < 10) subtrahend = 10; 
        if (minuend - subtrahend <= 0 && minuend > 10) minuend = subtrahend + (Math.floor(Math.random()*5)+1);

        onesMinuend = minuend % 10;
        tensMinuend = Math.floor(minuend / 10);
        onesSubtrahend = subtrahend % 10;
        tensSubtrahend = Math.floor(subtrahend/10);
        
        actualIsBorrowingNeeded = onesMinuend < onesSubtrahend && tensMinuend > 0;

      } while (!actualIsBorrowingNeeded || minuend - subtrahend <= 0 || minuend - subtrahend >= 100 || tensSubtrahend === 0); 
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
           setGameView("playing"); 
        } else {
        }
      }, 1200);
    }
  };

  const handleStage1Or2AnswerSelect = (answer: number) => {
    if (!currentProblem) return;
    setSelectedAnswer(answer);
    handleAnswerSubmission(answer === currentProblem.correctAnswer);
  };
  
  const handleStage3DigitPress = (digit: string) => {
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
        toast({ title: "Missing Input", description: "Please fill all answer boxes for the difference.", variant: "destructive", duration: 2000 });
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
        hintDescription = `What is ${currentProblem.minuend} take away ${currentProblem.subtrahend}? Count the items left.`;
    } else if (stage?.id === 'sub-numbers') {
      hintDescription = `What is ${currentProblem.minuend} minus ${currentProblem.subtrahend}?`;
    } else if (stage?.id === 'sub-borrow') {
       hintDescription = `Remember: if the top digit in the ones column is smaller than the bottom digit, you need to borrow 1 ten from the tens column. The tens digit becomes one less, and the ones digit becomes 10 more. Then subtract column by column.`;
    }

    toast({
      title: "Hint!",
      description: hintDescription,
      duration: stage?.id === 'sub-borrow' ? 5000 : 3000,
    });
  };

  useEffect(() => {
    document.title = 'Subtraction Sprints';
  }, []);

  if (isLoadingAI) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">Thinking...</p>
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
          <Link href="/">
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
