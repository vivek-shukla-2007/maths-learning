
"use client";

import type * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LevelSelector } from '@/components/place-value/LevelSelector';
import { BlockDisplay } from '@/components/place-value/BlockDisplay';
import { QuizControls } from '@/components/place-value/QuizControls';
import { ScoreDisplay } from '@/components/place-value/ScoreDisplay';
import { AITutorDialog } from '@/components/place-value/AITutorDialog';
import { adaptiveTutoring, type AdaptiveTutoringInput } from '@/ai/flows/adaptive-tutoring';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home } from 'lucide-react';
import { QUESTIONS_PER_BATCH, MIN_LEVEL_MAX_VALUE, MAX_LEVEL_MAX_VALUE } from '@/lib/constants';

type GameStage = "levelSelection" | "playing" | "answered" | "evaluatingAI" | "aiFeedback";

export default function PlaceValuePage(): React.JSX.Element {
  const [gameStage, setGameStage] = useState<GameStage>("levelSelection");
  const [currentMaxNumber, setCurrentMaxNumber] = useState<number>(MIN_LEVEL_MAX_VALUE);
  
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [tens, setTens] = useState<number>(0);
  const [ones, setOnes] = useState<number>(0);
  const [options, setOptions] = useState<number[]>([]);
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  // Feedback state is no longer used for UI text, only for button color logic if needed elsewhere
  // const [feedback, setFeedback] = useState<string>("");
  
  const [score, setScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });
  const [questionsInBatch, setQuestionsInBatch] = useState<number>(0);

  const [lastSelectedAnswerForAI, setLastSelectedAnswerForAI] = useState<number>(0);
  const [lastCorrectAnswerForAI, setLastCorrectAnswerForAI] = useState<number>(0);

  const [aiTutorExplanation, setAiTutorExplanation] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const { toast } = useToast();

  const generateOptions = useCallback((correctNum: number, maxNum: number): number[] => {
    const incorrectOptions = new Set<number>();
    while (incorrectOptions.size < 3) {
      const randomOffset = Math.floor(Math.random() * 10) + 1;
      let potentialOption;
      if (Math.random() < 0.5) {
        potentialOption = Math.random() < 0.5 ? correctNum + randomOffset : correctNum - randomOffset;
      } else {
        potentialOption = Math.floor(Math.random() * maxNum) + 1;
      }
      
      if (potentialOption !== correctNum && potentialOption > 0 && potentialOption <= maxNum) {
        incorrectOptions.add(potentialOption);
      }
    }
    const allOptions = [correctNum, ...Array.from(incorrectOptions)];
    return allOptions.sort(() => Math.random() - 0.5);
  }, []);

  const generateNewQuestion = useCallback((maxNum: number) => {
    const newTarget = Math.floor(Math.random() * maxNum) + 1;
    setTargetNumber(newTarget);
    setTens(Math.floor(newTarget / 10));
    setOnes(newTarget % 10);
    setOptions(generateOptions(newTarget, maxNum));
    setSelectedAnswer(null);
    // setFeedback(""); // No longer used for UI text
    setGameStage("playing");
  }, [generateOptions]);

  const handleLevelSelect = (maxNumberFromLevel: number) => {
    setCurrentMaxNumber(maxNumberFromLevel);
    setScore({ correct: 0, total: 0 });
    setQuestionsInBatch(0);
    generateNewQuestion(maxNumberFromLevel);
  };

  const handleGoHome = () => {
    setGameStage("levelSelection");
    setScore({ correct: 0, total: 0 });
    setQuestionsInBatch(0);
    setCurrentMaxNumber(MIN_LEVEL_MAX_VALUE); // Reset level
  };

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer); // Show selection (button will turn red or green)
    setLastSelectedAnswerForAI(answer); // For AI Tutor
    setLastCorrectAnswerForAI(targetNumber); // For AI Tutor

    if (answer === targetNumber) {
      // Correct Answer
      setScore(prev => ({ 
        correct: prev.correct + 1,
        total: prev.total // Total increments when proceeding to next question
      }));
      setGameStage("answered"); // Go to "answered" state, "Next Question" button appears
    } else {
      // Incorrect Answer
      // User stays on the same question. `gameStage` remains "playing".
      // `selectedAnswer` is set, so the button will be red.
      // They can choose another option from the QuizControls.
      // Score is not updated for an incorrect attempt on the current question.
    }
  };
  
  const handleShowHint = () => {
    // setFeedback(`Hint: The number is ${targetNumber}. Try to count the blocks!`); // No text feedback
    toast({
      title: "Hint!",
      description: `Try counting the blue (tens) and yellow (ones) blocks carefully! Each blue stack is 10.`,
    });
  };

  const proceedToNextStep = () => {
    // This is called after a correct answer.
    // Increment total questions *completed* here.
    setScore(prev => ({ ...prev, total: prev.total + 1 })); 

    if (questionsInBatch + 1 >= QUESTIONS_PER_BATCH) {
      setGameStage("evaluatingAI");
    } else {
      setQuestionsInBatch(prev => prev + 1);
      generateNewQuestion(currentMaxNumber);
    }
  };

  useEffect(() => {
    if (gameStage === "evaluatingAI") {
      const callAI = async () => {
        setIsLoadingAI(true);
        try {
          const aiInput: AdaptiveTutoringInput = {
            level: currentMaxNumber,
            studentAnswer: lastSelectedAnswerForAI,
            correctAnswer: lastCorrectAnswerForAI,
            score: `${score.correct} out of ${score.total || 1} correct`, // ensure score.total is not 0 for string
          };
          const aiResponse = await adaptiveTutoring(aiInput);
          
          let nextLevel = Math.max(MIN_LEVEL_MAX_VALUE, aiResponse.nextLevel);
          nextLevel = Math.min(MAX_LEVEL_MAX_VALUE, nextLevel);
          
          setCurrentMaxNumber(nextLevel);
          setAiTutorExplanation(aiResponse.explanation);
          setGameStage("aiFeedback");
          // Reset score for the new batch of questions at the new level
          setScore({ correct: 0, total: 0 }); 
          setQuestionsInBatch(0);
        } catch (error) {
          console.error("Error with AI Tutor:", error);
          toast({ title: "AI Tutor Error", description: "Could not get feedback from AI tutor. Continuing with current level.", variant: "destructive" });
          setGameStage("playing"); // Go back to playing
          generateNewQuestion(currentMaxNumber); // Generate new question for current level
        } finally {
          setIsLoadingAI(false);
        }
      };
      callAI();
    }
  }, [gameStage, currentMaxNumber, lastSelectedAnswerForAI, lastCorrectAnswerForAI, score, toast, generateNewQuestion]);

  const handleAIClose = () => {
    setGameStage("playing");
    generateNewQuestion(currentMaxNumber);
  };

  if (isLoadingAI) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">Our AI Tutor is thinking...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6 py-6">
      <div className="w-full max-w-3xl flex justify-between items-start mb-4 px-2">
        {gameStage !== "levelSelection" ? (
           <ScoreDisplay correct={score.correct} total={score.total} />
        ) : <div className="h-10"/>} {/* Placeholder to keep layout consistent and prevent jump */}
        
        {gameStage !== "levelSelection" && (
          <Button variant="outline" size="lg" onClick={handleGoHome} className="shadow-md">
            <Home className="mr-2 h-5 w-5" /> Home
          </Button>
        )}
      </div>

      {/* Header text removed, title is in layout.tsx metadata */}

      {gameStage === "levelSelection" && (
        <LevelSelector onLevelSelect={handleLevelSelect} disabled={isLoadingAI} />
      )}

      {(gameStage === "playing" || gameStage === "answered") && (
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-stretch mt-2"> {/* items-stretch to make columns equal height */}
          <Card className="shadow-xl flex flex-col"> {/* flex flex-col for Card */}
            <CardHeader>
              <CardTitle className="text-3xl text-center text-primary">Count the Blocks!</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow"> {/* flex-grow to take available space */}
              <BlockDisplay tens={tens} ones={ones} />
            </CardContent>
          </Card>
          <div className="flex flex-col h-full pt-2 md:pt-0"> {/* This div will contain QuizControls */}
            <QuizControls
              options={options}
              onAnswerSelect={handleAnswerSelect}
              onShowHint={handleShowHint}
              onNextQuestion={proceedToNextStep}
              isAnswered={gameStage === "answered"}
              selectedAnswer={selectedAnswer}
              correctAnswer={targetNumber}
              className="mt-auto" // Pushes QuizControls to the bottom
            />
          </div>
        </div>
      )}

      <AITutorDialog
        isOpen={gameStage === "aiFeedback"}
        onClose={handleAIClose}
        explanation={aiTutorExplanation}
        newLevel={currentMaxNumber}
      />
    </div>
  );
}
