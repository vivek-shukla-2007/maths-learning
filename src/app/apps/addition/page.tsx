
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
  actualCarry?: number; // Added for Stage 3
}

export default function AdditionAdventurePage(): React.JSX.Element {
  const [gameView, setGameView] = useState<GameView>("stageSelection");
  const [currentStageId, setCurrentStageId] = useState<string>(ADDITION_STAGES[0].id);

  const [currentProblem, setCurrentProblem] = useState<AdditionProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [stage3AnswerDigits, setStage3AnswerDigits] = useState<[string, string]>(['', '']); // [tens, ones]

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
        num2 = Math.floor(Math.random() * 10); // 0-9
      } else if (num2 === 10) {
        num1 = Math.floor(Math.random() * 10); // 0-9
      }
       while (num1 + num2 > 19) { 
        num1 = Math.floor(Math.random() * (stage.maxOperandValue + 1));
        num2 = Math.floor(Math.random() * (stage.maxOperandValue + 1));
        if (num1 === 10) num2 = Math.floor(Math.random() * 10);
        else if (num2 === 10) num1 = Math.floor(Math.random() * 10);
       }
    } else if (stage.id === 'add-carry') {
       const typeOfProblem = Math.random();
       if (typeOfProblem < 0.3) { // Single digit + single digit (results in carry)
           num1 = Math.floor(Math.random() * 5) + 5; // 5-9
           num2 = Math.floor(Math.random() * (9 - (10 - num1) +1)) + (10 - num1); 
           if (num1 + num2 < 10) num2 = 10 - num1 + Math.floor(Math.random()* (9 - (10-num1) +1));
       } else if (typeOfProblem < 0.7) { // Double digit + single digit
           num1 = Math.floor(Math.random() * 11) + 10; // 10-20
           num2 = Math.floor(Math.random() * 9) + 1;   // 1-9
           if (Math.random() > 0.5) [num1, num2] = [num2, num1]; // Swap to allow single + double
       } else { // Double digit + double digit (simple, sum < 40 for now, may or may not carry)
           num1 = Math.floor(Math.random() * 10) + 10; //10-19
           num2 = Math.floor(Math.random() * 10) + 10; //10-19
           if (num1 + num2 > 39) { // limit sum to 39
             if (num1 > num2) num1 = 39 - num2 - (Math.floor(Math.random()*5));
             else num2 = 39 - num1 - (Math.floor(Math.random()*5));
           }
       }
       // Ensure num1 is not smaller than num2 if it makes carry awkward, or just ensure num1 is generally larger if double digit.
       if (num1 < 10 && num2 >=10 && num2 > num1) [num1, num2] = [num2, num1];
       else if (num1 >= 10 && num2 >= 10 && num2 > num1) [num1, num2] = [num2, num1]; // Keep larger number on top for conventional display

       const ones1 = num1 % 10;
       const ones2 = num2 % 10;
       actualCarry = Math.floor((ones1 + ones2) / 10);
    }

    const correctAnswer = num1 + num2;
    const maxPossibleSum = stage.id === 'add-visual' ? 10 : (stage.id === 'add-numbers' ? 19 : 99); // Increased max for Stage 3 options
    const options = (stage.id !== 'add-carry') ? generateProblemOptions(correctAnswer, maxPossibleSum) : [];

    setCurrentProblem({ num1, num2, correctAnswer, options, type: 'addition', actualCarry });
    setSelectedAnswer(null);
    setStage3AnswerDigits(['', '']);
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
      setFeedbackAnimation({ type: 'incorrect', key: Date.now() });
      setScore(prev => ({ 
        correct: prev.correct,
        // Only increment total for stage 3 on incorrect if we want to penalize tries.
        // For stages 1 & 2, total is incremented on selection.
        // Let's keep it simple: only increment total for incorrect if it's NOT stage 3 (covered by submit)
        total: currentStageId !== 'add-carry' ? prev.total : prev.total // No, let's increment total on submit for stage 3 too
      }));
       if (currentStageId === 'add-carry') {
         setScore(prev => ({...prev, total: prev.total + 1})); // Increment total for stage 3 attempt
       }
      setTimeout(() => {
        setFeedbackAnimation(null);
        if (currentStageId === 'add-carry') {
          setStage3AnswerDigits(['', '']); 
          setGameView("playing"); 
        }
      }, 1200);
    }
  };

  const handleStage1Or2AnswerSelect = (answer: number) => {
    if (!currentProblem) return;
    setSelectedAnswer(answer);
    setScore(prev => ({ 
        correct: prev.correct,
        total: prev.total + 1 // Increment total for stages 1 & 2 here, as selection is an attempt
      }));
    handleAnswerSubmission(answer === currentProblem.correctAnswer);
  };
  
  const handleStage3DigitPress = (digit: string) => {
    setStage3AnswerDigits(prev => { // prev is [tens, ones]
      if (prev[1] === '') return [prev[0], digit]; // Fill ones place first (rightmost)
      if (prev[0] === '') return [digit, prev[1]]; // Then fill tens place (leftmost)
      return prev; // Both full, ignore
    });
  };

  const handleStage3ClearPress = () => {
    setStage3AnswerDigits(['', '']);
  };

  const handleStage3SubmitPress = () => {
    if (!currentProblem) return;
    
    const enteredAnswerStr = stage3AnswerDigits[0] + stage3AnswerDigits[1];
    if (stage3AnswerDigits[1] === '' && stage3AnswerDigits[0] === '') return; // if both empty
    if (stage3AnswerDigits[1] !== '' && stage3AnswerDigits[0] === '' && currentProblem.correctAnswer >= 10) {
        // If only ones digit is filled for a two-digit answer, it's likely an incomplete attempt
        // or they intended a single digit answer. We can allow it but it's likely wrong if answer > 9
    }


    // Form the number. If tens is empty, treat it as 0.
    const tensDigit = stage3AnswerDigits[0] === '' ? '0' : stage3AnswerDigits[0];
    const onesDigit = stage3AnswerDigits[1] === '' ? '0' : stage3AnswerDigits[1]; // Should usually not be empty if tens is filled
    
    // Ensure at least one digit is present before parsing.
    // If ones is empty but tens is not, this is unusual e.g. "5" + "" -> "50", so ensure ones is handled.
    // The logic for handleStage3DigitPress means ones (index 1) fills first.
    // So if stage3AnswerDigits[0] is filled, stage3AnswerDigits[1] must also be.
    // If stage3AnswerDigits[1] is filled, stage3AnswerDigits[0] might be empty.

    let enteredNum;
    if (stage3AnswerDigits[0] === '' && stage3AnswerDigits[1] !== '') { // e.g., answer is 7, user enters "" and "7"
      enteredNum = parseInt(stage3AnswerDigits[1], 10);
    } else if (stage3AnswerDigits[0] !== '' && stage3AnswerDigits[1] !== '') { // e.g., answer is 12, user enters "1" and "2"
      enteredNum = parseInt(stage3AnswerDigits[0] + stage3AnswerDigits[1], 10);
    } else {
      // Only tens filled (e.g. "1" and "") -> this is invalid based on input logic or only "" and ""
      // If both are empty, handleStage3SubmitPress already returns.
      // If only tens is filled, this path shouldn't be hit if input logic is correct (ones fills first).
      // For safety, if somehow only tens is entered, treat ones as 0.
      if (stage3AnswerDigits[0] !== '' && stage3AnswerDigits[1] === '') {
         enteredNum = parseInt(stage3AnswerDigits[0] + '0', 10); // Unlikely path, but safe
      } else {
        return; // Or toast an error: "Please enter a number"
      }
    }
        
    if (isNaN(enteredNum)) return; 

    handleAnswerSubmission(enteredNum === currentProblem.correctAnswer);
  };


  const handleShowHint = () => {
    if (!currentProblem) return;
    const stage = ADDITION_STAGES.find(s => s.id === currentStageId);
    let hintDescription = "Try counting carefully!";
    if (stage?.id === 'add-visual') { 
      // Hint button is hidden for this stage via AnswerOptions component
    } else if (stage?.id === 'add-numbers') {
      hintDescription = `What is ${currentProblem.num1} plus ${currentProblem.num2}?`;
    } else if (stage?.id === 'add-carry') {
       hintDescription = `Add the ones column first. Remember to include any carry shown at the top when you add the tens column.`;
    }

    toast({
      title: "Hint!",
      description: hintDescription,
      duration: 3000,
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
                stage3AnswerDigits={currentStageId === 'add-carry' ? stage3AnswerDigits : undefined}
                actualCarry={currentStageId === 'add-carry' ? currentProblem.actualCarry : undefined}
              />
            </CardContent>
          </Card>
          <div className="flex flex-col h-full pt-2 md:pt-0">
            {currentStageId !== 'add-carry' && currentProblem.options.length > 0 && (
                <AnswerOptions
                    options={currentProblem.options}
                    onAnswerSelect={handleStage1Or2AnswerSelect}
                    onShowHint={handleShowHint}
                    isAnswered={gameView === "answered" || (selectedAnswer !== null && selectedAnswer !== currentProblem.correctAnswer) }
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
                disabled={(gameView === "answered" && parseInt(stage3AnswerDigits.join(''),10) === currentProblem.correctAnswer) || gameView === "evaluatingAI"}
                className="mt-auto"
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
