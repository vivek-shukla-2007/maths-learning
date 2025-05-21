
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
import { Loader2, Zap, Home } from 'lucide-react'; // Added Home icon
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
  const [feedback, setFeedback] = useState<string>("");
  
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
    setFeedback("");
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
    // Optionally reset score or other game state if needed when going home
    setScore({ correct: 0, total: 0 });
    setQuestionsInBatch(0);
  };

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer);
    setGameStage("answered");
    setLastSelectedAnswerForAI(answer);
    setLastCorrectAnswerForAI(targetNumber);

    const newTotal = score.total + 1;
    if (answer === targetNumber) {
      setFeedback(`Correct! The number was ${targetNumber}.`);
      setScore(prev => ({ correct: prev.correct + 1, total: newTotal }));
    } else {
      setFeedback(`Oops! You chose ${answer}, but the correct answer was ${targetNumber}.`);
      setScore(prev => ({ correct: prev.correct, total: newTotal }));
    }
  };
  
  const handleShowHint = () => {
    setFeedback(`Hint: The number is ${targetNumber}. Try to count the blocks!`);
  };

  const proceedToNextStep = () => {
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
            score: `${score.correct} out of ${score.total} correct`,
          };
          const aiResponse = await adaptiveTutoring(aiInput);
          
          let nextLevel = Math.max(MIN_LEVEL_MAX_VALUE, aiResponse.nextLevel);
          nextLevel = Math.min(MAX_LEVEL_MAX_VALUE, nextLevel);
          
          setCurrentMaxNumber(nextLevel);
          setAiTutorExplanation(aiResponse.explanation);
          setGameStage("aiFeedback");
          setScore({ correct: 0, total: 0 }); 
          setQuestionsInBatch(0);
        } catch (error) {
          console.error("Error with AI Tutor:", error);
          toast({ title: "AI Tutor Error", description: "Could not get feedback from AI tutor. Continuing with current level.", variant: "destructive" });
          setGameStage("playing");
          generateNewQuestion(currentMaxNumber);
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
      <div className="w-full flex justify-between items-center mb-4 px-2">
        {gameStage !== "levelSelection" && (
           <ScoreDisplay correct={score.correct} total={score.total} />
        )}
        <div className="flex-grow"></div> {/* Spacer */}
        {gameStage !== "levelSelection" && (
          <Button variant="outline" size="lg" onClick={handleGoHome} className="shadow-md">
            <Home className="mr-2 h-5 w-5" /> Home
          </Button>
        )}
      </div>

      <header className="text-center">
        <h1 className="text-5xl font-bold text-primary">
          <Zap className="inline-block h-12 w-12 mr-2 text-accent" />
          Place Value Puzzles
        </h1>
        <p className="text-xl text-muted-foreground mt-2">Master tens and ones with fun challenges!</p>
      </header>

      {gameStage === "levelSelection" && (
        <LevelSelector onLevelSelect={handleLevelSelect} disabled={isLoadingAI} />
      )}

      {(gameStage === "playing" || gameStage === "answered") && (
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-start mt-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-primary">Count the Blocks!</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockDisplay tens={tens} ones={ones} />
            </CardContent>
          </Card>
          <div className="space-y-6 flex flex-col justify-between h-full">
            {/* QuizControls will be at the bottom of this flex column */}
            <QuizControls
              options={options}
              onAnswerSelect={handleAnswerSelect}
              onShowHint={handleShowHint}
              onNextQuestion={proceedToNextStep}
              feedback={feedback}
              isAnswered={gameStage === "answered"}
              selectedAnswer={selectedAnswer}
              correctAnswer={targetNumber}
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
