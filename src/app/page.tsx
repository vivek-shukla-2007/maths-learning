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
import { Loader2, Zap } from 'lucide-react';
import { QUESTIONS_PER_BATCH, MIN_LEVEL_MAX_VALUE, MAX_LEVEL_MAX_VALUE } from '@/lib/constants';

type GameStage = "levelSelection" | "playing" | "answered" | "evaluatingAI" | "aiFeedback";

export default function PlaceValuePage(): React.JSX.Element {
  const [gameStage, setGameStage] = useState<GameStage>("levelSelection");
  const [currentMaxNumber, setCurrentMaxNumber] = useState<number>(MIN_LEVEL_MAX_VALUE); // Max number for current questions, AI adjusted
  
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
      const randomOffset = Math.floor(Math.random() * 10) + 1; // 1 to 10
      let potentialOption;
      if (Math.random() < 0.5) { // Nearby numbers
        potentialOption = Math.random() < 0.5 ? correctNum + randomOffset : correctNum - randomOffset;
      } else { // Random numbers within range
        potentialOption = Math.floor(Math.random() * maxNum) + 1;
      }
      
      if (potentialOption !== correctNum && potentialOption > 0 && potentialOption <= maxNum) {
        incorrectOptions.add(potentialOption);
      }
    }
    const allOptions = [correctNum, ...Array.from(incorrectOptions)];
    return allOptions.sort(() => Math.random() - 0.5); // Shuffle
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
          
          let nextLevel = Math.max(MIN_LEVEL_MAX_VALUE, aiResponse.nextLevel); // Ensure min level
          nextLevel = Math.min(MAX_LEVEL_MAX_VALUE, nextLevel); // Ensure max level
          
          setCurrentMaxNumber(nextLevel);
          setAiTutorExplanation(aiResponse.explanation);
          setGameStage("aiFeedback");
          // Reset for new batch
          setScore({ correct: 0, total: 0 }); 
          setQuestionsInBatch(0);
        } catch (error) {
          console.error("Error with AI Tutor:", error);
          toast({ title: "AI Tutor Error", description: "Could not get feedback from AI tutor. Continuing with current level.", variant: "destructive" });
          setGameStage("playing"); // Fallback to continue playing
          generateNewQuestion(currentMaxNumber); // Generate a new question at current level
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
    <div className="w-full flex flex-col items-center space-y-8 py-8">
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
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-start">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Count the Blocks!</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockDisplay tens={tens} ones={ones} />
            </CardContent>
          </Card>
          <div className="space-y-6">
            <ScoreDisplay correct={score.correct} total={score.total} />
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
