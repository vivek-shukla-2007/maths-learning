
"use client";

import type * as React from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreDisplay } from '@/components/place-value/ScoreDisplay'; 
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListRestart, ThumbsUp, XCircle, LayoutGrid } from 'lucide-react';
import { ADDITION_STAGES } from '@/lib/constants';
import { StageSelector } from '@/components/addition/StageSelector';
import { ProblemDisplay } from '@/components/addition/ProblemDisplay';
import { AnswerOptions } from '@/components/addition/AnswerOptions';
import { NumpadInput } from '@/components/addition/NumpadInput';

type GameView = "stageSelection" | "playing" | "answered" | "evaluatingAI" | "aiFeedback";
type FeedbackAnimation = { type: 'correct' | 'incorrect', key: number } | null;

interface AdditionProblem {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
  type: 'addition';
  actualCarry: number; 
}

interface Stage3Inputs {
  carry: string;
  sumTens: string;
  sumOnes: string;
}

const initialStage3Inputs: Stage3Inputs = { carry: '', sumTens: '', sumOnes: '' };

export default function AdditionAdventurePage(): React.JSX.Element {
  const [gameView, setGameView] = useState<GameView>("stageSelection");
  const [currentStageId, setCurrentStageId] = useState<string>(ADDITION_STAGES[0].id);

  const [currentProblem, setCurrentProblem] = useState<AdditionProblem | null>(null);
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
            potentialOption = Math.floor(Math.random() * (maxNumInRange + 1));
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
    const stage = ADDITION_STAGES.find(s => s.id === stageId);
    if (!stage) return;

    let num1 = 0;
    let num2 = 0;
    let actualCarry = 0;

    if (stage.id === 'add-visual') {
      num1 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
      num2 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
      while (num1 + num2 > 10) { 
        num1 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
        num2 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
      }
    } else if (stage.id === 'add-numbers') {
      num1 = Math.floor(Math.random() * (stage.maxOperandValue + 1));
      num2 = Math.floor(Math.random() * (stage.maxOperandValue + 1));
      if (num1 === 10) {
        num2 = Math.floor(Math.random() * 10); 
      } else if (num2 === 10) {
        num1 = Math.floor(Math.random() * 10); 
      }
       while (num1 + num2 > 19) { 
        num1 = Math.floor(Math.random() * (stage.maxOperandValue + 1));
        num2 = Math.floor(Math.random() * (stage.maxOperandValue + 1));
        if (num1 === 10) num2 = Math.floor(Math.random() * 10);
        else if (num2 === 10) num1 = Math.floor(Math.random() * 10);
       }
    } else if (stage.id === 'add-carry') {
       let ones1 = 0, ones2 = 0;
       let tens1 = 0, tens2 = 0;

       do {
         num1 = Math.floor(Math.random() * 90) + 10; // 10-99
         num2 = Math.floor(Math.random() * 90) + 10; // 10-99

         ones1 = num1 % 10;
         tens1 = Math.floor(num1 / 10);
         ones2 = num2 % 10;
         tens2 = Math.floor(num2 / 10);
        // Ensure sum is 2 digits and there's a carry
       } while (ones1 + ones2 < 10 || num1 + num2 > 99); 

       if (num1 < num2) [num1, num2] = [num2, num1]; 
       
       actualCarry = Math.floor(( (num1 % 10) + (num2 % 10) ) / 10);
    }

    const correctAnswer = num1 + num2;
    const maxPossibleSum = stage.id === 'add-visual' ? 10 : (stage.id === 'add-numbers' ? 19 : 99);
    const options = (stage.id !== 'add-carry') ? generateProblemOptions(correctAnswer, maxPossibleSum) : [];

    setCurrentProblem({ num1, num2, correctAnswer, options, type: 'addition', actualCarry });
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
        if (currentStageId === 'add-carry') {
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
      if (prev.sumOnes === '') return { ...prev, sumOnes: digit };
      if (prev.carry === '') return { ...prev, carry: digit }; // Order: SumOnes, Carry, SumTens
      if (prev.sumTens === '') return { ...prev, sumTens: digit };
      return prev; 
    });
  };

  const handleStage3ClearPress = () => {
    setStage3Inputs(initialStage3Inputs);
  };

  const handleStage3SubmitPress = () => {
    if (!currentProblem) return;
    
    const { carry, sumTens, sumOnes } = stage3Inputs;

    if (sumOnes === '' || sumTens === '' || (currentProblem.actualCarry > 0 && carry === '')) {
        let message = "Please fill all answer boxes.";
        if (currentProblem.actualCarry > 0 && carry === '' && sumOnes !== '' && sumTens !== '') {
            message = "Don't forget the carry!"
        } else if (sumOnes === '') {
            message = "Please enter the ones digit for the sum.";
        } else if (sumTens === '') {
             message = "Please enter the tens digit for the sum.";
        }
        toast({ title: "Missing Input", description: message, variant: "destructive", duration: 2000 });
        return;
    }
    
    const enteredSum = parseInt(sumTens + sumOnes, 10);
    const enteredCarryNum = parseInt(carry || '0', 10); 

    const isCarryCorrect = enteredCarryNum === currentProblem.actualCarry;
    const isSumCorrect = enteredSum === currentProblem.correctAnswer;

    handleAnswerSubmission(isCarryCorrect && isSumCorrect);
  };


  const handleShowHint = () => {
    if (!currentProblem) return;
    const stage = ADDITION_STAGES.find(s => s.id === currentStageId);
    let hintDescription = "Try counting carefully!";

    if (stage?.id === 'add-visual') { 
    } else if (stage?.id === 'add-numbers') {
      hintDescription = `What is ${currentProblem.num1} plus ${currentProblem.num2}?`;
    } else if (stage?.id === 'add-carry') {
       hintDescription = `Add the ones column. Enter the ones digit of that sum in the bottom right box. Then, enter the carry digit (e.g., '1') in the red box above the tens. Finally, add the tens column (including any carry) and enter the tens digit of that sum in the bottom left box. For this problem, the actual carry from the ones column is ${currentProblem.actualCarry}.`;
    }

    toast({
      title: "Hint!",
      description: hintDescription,
      duration: stage?.id === 'add-carry' ? 7000 : 3000,
    });
  };

  useEffect(() => {
    document.title = 'Addition Adventure';
  }, []);

  if (isLoadingAI) {
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
          <Link href="/">
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
                stage3Inputs={currentStageId === 'add-carry' ? stage3Inputs : undefined}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col h-full pt-2 md:pt-0">
            {currentStageId !== 'add-carry' && currentProblem.options.length > 0 && (
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
            {currentStageId === 'add-carry' && (
              <NumpadInput
                onDigitPress={handleStage3DigitPress}
                onClearPress={handleStage3ClearPress}
                onSubmitPress={handleStage3SubmitPress}
                onShowHint={handleShowHint}
                disabled={(gameView === "answered" && stage3Inputs.sumTens !== '' && stage3Inputs.sumOnes !== '' && parseInt(stage3Inputs.sumTens + stage3Inputs.sumOnes) === currentProblem.correctAnswer && parseInt(stage3Inputs.carry || '0') === currentProblem.actualCarry) || gameView === "evaluatingAI"}
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
