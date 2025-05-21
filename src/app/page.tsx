
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

// NOTE TO USER: Please create a 'sounds' folder in your 'public' directory.
// Add 'correct_clap.mp3' and 'incorrect_buzz.mp3' (or similar sounds) to 'public/sounds/'.
const CORRECT_SOUND_SRC = '/sounds/correct_clap.mp3';
const INCORRECT_SOUND_SRC = '/sounds/incorrect_buzz.mp3';

export default function PlaceValuePage(): React.JSX.Element {
  const [gameStage, setGameStage] = useState<GameStage>("levelSelection");
  const [currentMaxNumber, setCurrentMaxNumber] = useState<number>(MIN_LEVEL_MAX_VALUE);
  
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [tens, setTens] = useState<number>(0);
  const [ones, setOnes] = useState<number>(0);
  const [options, setOptions] = useState<number[]>([]);
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const [score, setScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });
  const [questionsInBatch, setQuestionsInBatch] = useState<number>(0);

  const [lastSelectedAnswerForAI, setLastSelectedAnswerForAI] = useState<number>(0);
  const [lastCorrectAnswerForAI, setLastCorrectAnswerForAI] = useState<number>(0);

  const [aiTutorExplanation, setAiTutorExplanation] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const { toast } = useToast();

  const [correctAudio, setCorrectAudio] = useState<HTMLAudioElement | null>(null);
  const [incorrectAudio, setIncorrectAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const correctSound = new Audio(CORRECT_SOUND_SRC);
      const incorrectSound = new Audio(INCORRECT_SOUND_SRC);
      correctSound.preload = 'auto';
      incorrectSound.preload = 'auto';
      setCorrectAudio(correctSound);
      setIncorrectAudio(incorrectSound);
    }
  }, []);

  const playCorrectSound = useCallback(() => {
    correctAudio?.play().catch(error => console.error("Error playing correct sound:", error, "Ensure sound file exists at", CORRECT_SOUND_SRC));
  }, [correctAudio]);

  const playIncorrectSound = useCallback(() => {
    incorrectAudio?.play().catch(error => console.error("Error playing incorrect sound:", error, "Ensure sound file exists at", INCORRECT_SOUND_SRC));
  }, [incorrectAudio]);


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
    setCurrentMaxNumber(MIN_LEVEL_MAX_VALUE); 
  };

  const proceedToNextStep = useCallback(() => {
    setScore(prev => ({ ...prev, total: prev.total + 1 })); 

    if (questionsInBatch + 1 >= QUESTIONS_PER_BATCH) {
      setGameStage("evaluatingAI");
    } else {
      setQuestionsInBatch(prev => prev + 1);
      generateNewQuestion(currentMaxNumber);
    }
  }, [questionsInBatch, currentMaxNumber, generateNewQuestion]);

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer); 
    setLastSelectedAnswerForAI(answer); 
    setLastCorrectAnswerForAI(targetNumber);

    if (answer === targetNumber) {
      playCorrectSound();
      setScore(prev => ({ 
        correct: prev.correct + 1,
        total: prev.total 
      }));
      setGameStage("answered"); 
      setTimeout(() => {
        proceedToNextStep();
      }, 1000); // 1 second delay before moving to next question
    } else {
      playIncorrectSound();
      // User stays on the same question. gameStage remains "playing".
      // selectedAnswer is set, so the button will be red.
    }
  };
  
  const handleShowHint = () => {
    toast({
      title: "Hint!",
      description: `Try counting the blue (tens) and yellow (ones) blocks carefully! Each blue stack is 10.`,
      duration: 2000, // Auto-close after 2 seconds
    });
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
            // Ensure score.total for score string is at least 1 to avoid "X out of 0"
            score: `${score.correct} out of ${Math.max(1, score.total)} correct`, 
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
          // Reset score and batch for current level if AI fails, then generate new question
          setScore({ correct: 0, total: 0 });
          setQuestionsInBatch(0);
          generateNewQuestion(currentMaxNumber); 
        } finally {
          setIsLoadingAI(false);
        }
      };
      callAI();
    }
  }, [gameStage, currentMaxNumber, lastSelectedAnswerForAI, lastCorrectAnswerForAI, score, toast, generateNewQuestion]);

  const handleAIClose = () => {
    // AI Dialog closed, generate new question for the (potentially new) currentMaxNumber
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
        ) : <div className="h-10"/>} 
        
        {gameStage !== "levelSelection" && (
          <Button variant="outline" size="lg" onClick={handleGoHome} className="shadow-md">
            <Home className="mr-2 h-5 w-5" /> Home
          </Button>
        )}
      </div>

      {gameStage === "levelSelection" && (
        <LevelSelector onLevelSelect={handleLevelSelect} disabled={isLoadingAI || gameStage === "evaluatingAI"} />
      )}

      {(gameStage === "playing" || gameStage === "answered") && (
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-stretch mt-2">
          <Card className="shadow-xl flex flex-col">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-primary">Count the Blocks!</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow"> 
              <BlockDisplay tens={tens} ones={ones} />
            </CardContent>
          </Card>
          <div className="flex flex-col h-full pt-2 md:pt-0"> 
            <QuizControls
              options={options}
              onAnswerSelect={handleAnswerSelect}
              onShowHint={handleShowHint}
              isAnswered={gameStage === "answered"}
              selectedAnswer={selectedAnswer}
              correctAnswer={targetNumber}
              className="mt-auto" 
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
