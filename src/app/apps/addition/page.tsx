
"use client";

import type * as React from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreDisplay } from '@/components/place-value/ScoreDisplay'; // Re-using for consistency
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
  actualCarry: number; // Carry calculated from problem's ones digits
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // For stages 1 & 2
  const [stage3Inputs, setStage3Inputs] = useState<Stage3Inputs>(initialStage3Inputs);

  const [score, setScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });

  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false); // Placeholder for potential AI features
  const [feedbackAnimation, setFeedbackAnimation] = useState<FeedbackAnimation>(null);
  const { toast } = useToast();

  const generateProblemOptions = useCallback((correctNum: number, maxNumInRange: number): number[] => {
    const incorrectOptions = new Set<number>();
    const rangeForOptions = Math.max(10, correctNum + 5); // Ensure options are somewhat spread

    while (incorrectOptions.size < 3) {
      let potentialOption;
      // Generate options closer to the correct answer more often
      const offsetDirection = Math.random() < 0.5 ? -1 : 1;
      const smallOffset = Math.floor(Math.random() * 3) + 1; // e.g., +/- 1, 2
      const largerOffset = Math.floor(Math.random() * 5) + 1; // e.g., +/- 1 to 5

      if (Math.random() < 0.7) { // 70% chance for small offset
        potentialOption = correctNum + (offsetDirection * smallOffset);
      } else { // 30% chance for larger offset or completely random within range
        if (Math.random() < 0.5) {
            potentialOption = correctNum + (offsetDirection * largerOffset);
        } else {
            potentialOption = Math.floor(Math.random() * (maxNumInRange + 1));
        }
      }
      
      // Ensure option is valid and not the correct answer
      if (potentialOption !== correctNum && potentialOption >= 0 && potentialOption <= maxNumInRange + 5) { // Allow slightly outside maxNum for distractors
        incorrectOptions.add(potentialOption);
      }
    }
    const allOptions = [correctNum, ...Array.from(incorrectOptions)];
    return allOptions.sort(() => Math.random() - 0.5); // Shuffle options
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
      // Ensure sum is not too large for visual representation, e.g. max 10 for easy star counting
      while (num1 + num2 > 10) {
        num1 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
        num2 = Math.floor(Math.random() * (stage.maxOperandValue - stage.minOperandValue + 1)) + stage.minOperandValue;
      }
    } else if (stage.id === 'add-numbers') {
      // Max for one operand is 10. If one is 10, other is 0-9. So max sum is 19.
      num1 = Math.floor(Math.random() * (stage.maxOperandValue + 1)); // 0-10
      num2 = Math.floor(Math.random() * (stage.maxOperandValue + 1)); // 0-10
      if (num1 === 10) {
        num2 = Math.floor(Math.random() * 10); // 0-9
      } else if (num2 === 10) {
        num1 = Math.floor(Math.random() * 10); // 0-9
      }
       // Ensure sum isn't too large if both are < 10 but sum > 19 (e.g. 10+10 is not intended here)
       // Max sum for stage 2 is 19.
       while (num1 + num2 > 19) { 
        num1 = Math.floor(Math.random() * (stage.maxOperandValue + 1));
        num2 = Math.floor(Math.random() * (stage.maxOperandValue + 1));
        if (num1 === 10) num2 = Math.floor(Math.random() * 10);
        else if (num2 === 10) num1 = Math.floor(Math.random() * 10);
       }
    } else if (stage.id === 'add-carry') {
       // For Stage 3, generate problems that might involve a carry.
       // Max operand value set in constants (e.g., 20) to keep sums manageable (e.g., < 99).
       // Types of problems:
       // 1. Single digit + single digit that results in a carry (e.g., 7+5)
       // 2. Double digit + single digit (e.g., 17+5)
       // 3. Double digit + double digit (e.g., 17+15)
       const typeOfProblem = Math.random();
       if (typeOfProblem < 0.3) { // Single digit + single digit (results in carry)
           // Ensure num1 + num2 >= 10
           num1 = Math.floor(Math.random() * 5) + 5; // 5-9
           num2 = Math.floor(Math.random() * (9 - (10 - num1) +1)) + (10 - num1); // Ensures sum is at least 10
           // Safety check if somehow the above logic fails
           if (num1 + num2 < 10) num2 = 10 - num1 + Math.floor(Math.random()* (9 - (10-num1) +1));

       } else if (typeOfProblem < 0.7) { // Double digit + single digit (ensure num1 is double digit for typical column format)
           num1 = Math.floor(Math.random() * (stage.maxOperandValue - 10 + 1)) + 10; // e.g. 10-20 if maxOpVal is 20
           num2 = Math.floor(Math.random() * 9) + 1;   // 1-9
           // Randomly swap if num2 ends up being larger, to vary presentation, but generally keep 2-digit on top.
           if (Math.random() < 0.3 && num1 > num2 + 9) { // Occasionally make num2 the larger one if it's a 2-digit + 1-digit resulting in a 2-digit
              [num1, num2] = [num2, num1];
           }
       } else { // Double digit + double digit (simple, sum < 99)
           num1 = Math.floor(Math.random() * (stage.maxOperandValue - 10 + 1)) + 10;
           num2 = Math.floor(Math.random() * (stage.maxOperandValue - 10 + 1)) + 10;
       }
       // Ensure num1 is generally larger or the first number if both are double digit for conventional display
       if (num1 < num2 && (num1 >=10 && num2 >=10)) [num1, num2] = [num2, num1]; 
       else if (num2 >=10 && num1 < 10) [num1, num2] = [num2, num1]; // Ensure 2-digit number is on top

       // Calculate actual carry from the ones digits
       const ones1 = num1 % 10;
       const ones2 = num2 % 10;
       actualCarry = Math.floor((ones1 + ones2) / 10);
    }

    const correctAnswer = num1 + num2;
    // Determine max possible sum for options generation for stages 1 and 2
    const maxPossibleSum = stage.id === 'add-visual' ? 10 : (stage.id === 'add-numbers' ? 19 : 99);
    const options = (stage.id !== 'add-carry') ? generateProblemOptions(correctAnswer, maxPossibleSum) : [];

    setCurrentProblem({ num1, num2, correctAnswer, options, type: 'addition', actualCarry });
    setSelectedAnswer(null);
    setStage3Inputs(initialStage3Inputs); // Reset stage 3 inputs
    setGameView("playing");
  }, [generateProblemOptions]);


  const handleStageSelect = (stageId: string) => {
    setCurrentStageId(stageId);
    setScore({ correct: 0, total: 0 }); // Reset score when stage changes
    generateNewProblem(stageId);
  };

  const handleGameMenu = () => {
    setGameView("stageSelection");
    setScore({ correct: 0, total: 0 });
    setCurrentProblem(null); // Clear current problem
  };

  const proceedToNextProblem = useCallback(() => {
    generateNewProblem(currentStageId);
  }, [currentStageId, generateNewProblem]);

  // Handles answer submission for all stages
  const handleAnswerSubmission = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1 // Increment total only on correct for stage 3, or on any attempt for 1&2.
                               // Let's unify: increment total on any "final" attempt.
      }));
      setFeedbackAnimation({ type: 'correct', key: Date.now() });
      setGameView("answered"); // Show feedback
      setTimeout(() => {
        proceedToNextProblem();
        setFeedbackAnimation(null);
      }, 1200); // Wait for animation
    } else {
      // For Stage 1 & 2, total is incremented on selection.
      // For Stage 3, total is incremented on submit.
      if (currentStageId !== 'add-carry') {
         setScore(prev => ({ ...prev, total: prev.total +1})); // Increment total for wrong attempt in stage 1 & 2
      } else {
         setScore(prev => ({ ...prev, total: prev.total + 1})); // Increment total for wrong attempt in stage 3
      }
      setFeedbackAnimation({ type: 'incorrect', key: Date.now() });
      setTimeout(() => {
        setFeedbackAnimation(null);
        if (currentStageId === 'add-carry') {
          // Don't clear inputs for Stage 3, let user correct
          setGameView("playing"); // Allow re-submission
        }
        // For stage 1 & 2, wrong answer is final for that question, so they just see feedback
        // and then next problem is auto-loaded if we had such logic, or they click next.
        // Current logic: correct -> auto-next. Incorrect -> stays, shows feedback.
        // Let's make incorrect on Stage 3 clear inputs for a fresh try on the same problem
        if (currentStageId === 'add-carry') {
          setStage3Inputs(initialStage3Inputs); // Clear inputs for retry
          setGameView("playing"); 
        }

      }, 1200);
    }
  };

  // For Stage 1 and Stage 2 (multiple choice)
  const handleStage1Or2AnswerSelect = (answer: number) => {
    if (!currentProblem) return;
    setSelectedAnswer(answer);
    handleAnswerSubmission(answer === currentProblem.correctAnswer);
  };
  
  // For Stage 3 Numpad
  const handleStage3DigitPress = (digit: string) => {
    setStage3Inputs(prev => {
      if (prev.sumOnes === '') return { ...prev, sumOnes: digit };
      if (prev.sumTens === '') return { ...prev, sumTens: digit };
      if (prev.carry === '') return { ...prev, carry: digit }; // Allow input to carry
      return prev; // All full
    });
  };

  const handleStage3ClearPress = () => {
    setStage3Inputs(initialStage3Inputs);
  };

  const handleStage3SubmitPress = () => {
    if (!currentProblem) return;
    
    const { carry, sumTens, sumOnes } = stage3Inputs;

    // Ensure sum digits are provided before parsing
    if (sumOnes === '' && sumTens === '') { // Basic check, could be more robust
        toast({ title: "Missing Answer", description: "Please enter digits for the sum.", variant: "destructive", duration: 2000 });
        return;
    }
    
    // Default to '0' if a field is empty for calculation, though ideally all should be filled.
    const enteredSumOnes = sumOnes === '' ? '0' : sumOnes;
    const enteredSumTens = sumTens === '' ? '0' : sumTens;
    const enteredCarry = carry === '' ? '0' : carry; // If carry is not applicable, actualCarry will be 0.

    const enteredSum = parseInt(enteredSumTens + enteredSumOnes, 10);
    const enteredCarryNum = parseInt(enteredCarry, 10);

    const isCarryCorrect = enteredCarryNum === currentProblem.actualCarry;
    const isSumCorrect = enteredSum === currentProblem.correctAnswer;

    handleAnswerSubmission(isCarryCorrect && isSumCorrect);
  };


  const handleShowHint = () => {
    if (!currentProblem) return;
    const stage = ADDITION_STAGES.find(s => s.id === currentStageId);
    let hintDescription = "Try counting carefully!"; // Default hint

    if (stage?.id === 'add-visual') { 
      // Hint button is hidden for this stage via AnswerOptions component
    } else if (stage?.id === 'add-numbers') {
      hintDescription = `What is ${currentProblem.num1} plus ${currentProblem.num2}?`;
    } else if (stage?.id === 'add-carry') {
       // Provide a hint about the actual carry for the current problem if the user is stuck
       hintDescription = `Add the ones column first. Then, input your answer for the ones place. Next, input the tens place. Finally, if there was a carry from the ones column, input the carry digit (usually '1') in the box above the tens column. For this problem, the actual carry from the ones column is ${currentProblem.actualCarry}.`;
    }

    toast({
      title: "Hint!",
      description: hintDescription,
      duration: stage?.id === 'add-carry' ? 5000 : 3000, // Longer duration for more complex hint
    });
  };

  useEffect(() => {
    // Set document title, can be expanded
    document.title = 'Addition Adventure';
  }, []);

  // UI Rendering
  if (isLoadingAI) { // Placeholder for future AI processing state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">AI Tutor is thinking...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6 py-6 relative">
      {/* Header: Score and Navigation */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 px-2">
        <div className="flex-1"> {/* Score display takes available space on left */}
          {gameView !== "stageSelection" && currentProblem && (
            <ScoreDisplay correct={score.correct} total={score.total} />
          )}
        </div>
        <div className="flex items-center gap-3 md:gap-4"> {/* Navigation buttons on right */}
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

      {/* Stage Selection View */}
      {gameView === "stageSelection" && (
        <StageSelector
          stages={ADDITION_STAGES}
          onStageSelect={handleStageSelect}
          disabled={isLoadingAI} // Disable if AI is processing (future use)
        />
      )}

      {/* Playing or Answered View */}
      {(gameView === "playing" || gameView === "answered") && currentProblem && (
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-start mt-2"> {/* items-start to align top */}
          {/* Problem Display Card */}
          <Card className="shadow-xl flex flex-col min-h-[300px] md:min-h-[400px]"> {/* Ensure consistent height */}
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
                // actualCarry is now part of currentProblem, so ProblemDisplay can use it directly if needed for context, but user input is primary
              />
            </CardContent>
          </Card>

          {/* Answer Input Area (Multiple Choice or Numpad) */}
          <div className="flex flex-col h-full pt-2 md:pt-0"> {/* Ensure this column can grow and push content down */}
            {currentStageId !== 'add-carry' && currentProblem.options.length > 0 && (
                <AnswerOptions
                    options={currentProblem.options}
                    onAnswerSelect={handleStage1Or2AnswerSelect}
                    onShowHint={handleShowHint}
                    isAnswered={gameView === "answered" || (selectedAnswer !== null && selectedAnswer !== currentProblem.correctAnswer) }
                    selectedAnswer={selectedAnswer}
                    correctAnswer={currentProblem.correctAnswer}
                    className="mt-auto" // Pushes to bottom if container allows
                    disabled={(gameView === "answered" && selectedAnswer === currentProblem.correctAnswer) || gameView === "evaluatingAI"}
                    stageId={currentStageId} // Pass stageId to conditionally hide hint
                />
            )}
            {currentStageId === 'add-carry' && (
              <NumpadInput
                onDigitPress={handleStage3DigitPress}
                onClearPress={handleStage3ClearPress}
                onSubmitPress={handleStage3SubmitPress}
                onShowHint={handleShowHint} // Pass hint handler to numpad area
                disabled={(gameView === "answered" && stage3Inputs.sumTens !== '' && stage3Inputs.sumOnes !== '' && parseInt(stage3Inputs.sumTens + stage3Inputs.sumOnes) === currentProblem.correctAnswer && parseInt(stage3Inputs.carry || '0') === currentProblem.actualCarry) || gameView === "evaluatingAI"}
                className="mt-auto" // Pushes to bottom
                showHintButton={true} // Explicitly enable hint button for Stage 3 numpad
              />
            )}
          </div>
        </div>
      )}

      {/* Feedback Animation Overlay */}
      {feedbackAnimation && (
        <div
          key={feedbackAnimation.key}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className={`p-8 rounded-full shadow-2xl
            ${feedbackAnimation.type === 'correct' ? 'bg-green-500/80' : 'bg-red-500/80'}
            animate-scale-up-pop`} // Ensure this animation is defined in globals.css
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

    
