
"use client";

import type * as React from 'react';
// Removed Metadata import as it's not used here for export
import Link from 'next/link';
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
import { Loader2, ListRestart, ThumbsUp, XCircle, LayoutGrid } from 'lucide-react';
import { QUESTIONS_PER_BATCH, MIN_LEVEL_MAX_VALUE, MAX_LEVEL_MAX_VALUE, LEVELS } from '@/lib/constants';

// Metadata export was removed as it's not allowed in "use client" components.
// Document title is set using useEffect below.

type GameStage = "levelSelection" | "playing" | "answered" | "evaluatingAI" | "aiFeedback";
type FeedbackAnimation = { type: 'correct' | 'incorrect', key: number } | null;

export default function PlaceValuePage(): React.JSX.Element {
  const [gameStage, setGameStage] = useState<GameStage>("levelSelection");
  const [currentMaxNumber, setCurrentMaxNumber] = useState<number>(LEVELS[0].max);
  
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [tens, setTens] = useState<number>(0);
  const [ones, setOnes] = useState<number>(0);
  const [options, setOptions] = useState<number[]>([]);
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const [score, setScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });
  
  const [lastSelectedAnswerForAI, setLastSelectedAnswerForAI] = useState<number>(0);
  const [lastCorrectAnswerForAI, setLastCorrectAnswerForAI] = useState<number>(0);

  const [aiTutorExplanation, setAiTutorExplanation] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const [feedbackAnimation, setFeedbackAnimation] = useState<FeedbackAnimation>(null);

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
    setGameStage("playing");
  }, [generateOptions]);

  const handleLevelSelect = (levelMax: number) => {
    setCurrentMaxNumber(levelMax);
    generateNewQuestion(levelMax);
  };

  const handleGameMenu = () => {
    setGameStage("levelSelection");
    setScore({ correct: 0, total: 0 });
    setCurrentMaxNumber(LEVELS[0].max); 
  };

  const proceedToNextStep = useCallback(() => {
    if (score.total > 0 && (score.total % QUESTIONS_PER_BATCH === 0)) { 
       setGameStage("evaluatingAI");
    } else {
      generateNewQuestion(currentMaxNumber);
    }
  }, [score.total, currentMaxNumber, generateNewQuestion]);

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer); 
    
    if (answer === targetNumber) {
      setLastSelectedAnswerForAI(answer); 
      setLastCorrectAnswerForAI(targetNumber);
      setScore(prev => ({ 
        correct: prev.correct + 1,
        total: prev.total + 1 
      }));
      setFeedbackAnimation({ type: 'correct', key: Date.now() });
      setGameStage("answered"); 
      setTimeout(() => {
        proceedToNextStep();
        setFeedbackAnimation(null); 
      }, 1200); 
    } else {
      setFeedbackAnimation({ type: 'incorrect', key: Date.now() });
      setTimeout(() => {
        setFeedbackAnimation(null);
      }, 1200); 
    }
  };
  
  const handleShowHint = () => {
    toast({
      title: "Hint!",
      description: `Try counting the tens and ones blocks carefully!`,
      duration: 2000, 
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
            score: `${score.correct} out of ${Math.max(1, score.total)} correct`, 
          };
          const aiResponse = await adaptiveTutoring(aiInput);
          
          let nextLevel = Math.max(MIN_LEVEL_MAX_VALUE, aiResponse.nextLevel);
          nextLevel = Math.min(MAX_LEVEL_MAX_VALUE, nextLevel);
          
          setCurrentMaxNumber(nextLevel);
          setAiTutorExplanation(aiResponse.explanation);
          setGameStage("aiFeedback");
          setScore({ correct: 0, total: 0 }); 
        } catch (error) {
          console.error("Error with AI Tutor:", error);
          toast({ title: "AI Tutor Error", description: "Could not get feedback from AI tutor. Continuing with current level.", variant: "destructive", duration: 3000 });
          setScore({ correct: 0, total: 0 });
          generateNewQuestion(currentMaxNumber); 
        } finally {
          setIsLoadingAI(false);
        }
      };
      callAI();
    }
  }, [gameStage, currentMaxNumber, lastSelectedAnswerForAI, lastCorrectAnswerForAI, score, toast, generateNewQuestion]);

  const handleAIClose = () => {
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
  
  useEffect(() => {
    document.title = 'Place Value Puzzles';
  }, []);


  return (
    <div className="w-full flex flex-col items-center space-y-6 py-6 relative">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 px-2">
        <div className="flex-1"> 
          {gameStage !== "levelSelection" && (
            <ScoreDisplay correct={score.correct} total={score.total} />
          )}
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {gameStage !== "levelSelection" && (
            <Button variant="outline" size="lg" onClick={handleGameMenu} className="shadow-md text-sm md:text-base">
              <ListRestart className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Game Menu
            </Button>
          )}
          <Link href="/" passHref>
            <Button variant="secondary" size="lg" className="shadow-md text-sm md:text-base">
              <LayoutGrid className="mr-2 h-4 w-4 md:h-5 md:w-5" /> All Apps
            </Button>
          </Link>
        </div>
      </div>

      {gameStage === "levelSelection" && (
        <LevelSelector 
          onLevelSelect={handleLevelSelect} 
          disabled={isLoadingAI || gameStage === "evaluatingAI"}
        />
      )}

      {(gameStage === "playing" || gameStage === "answered") && (
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-stretch mt-2">
          <Card className="shadow-xl flex flex-col">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-primary">Count the Blocks!</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow"> 
              <BlockDisplay 
                tens={tens} 
                ones={ones}
              />
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
              disabled={gameStage === "answered" && selectedAnswer === targetNumber}
            />
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

      <AITutorDialog
        isOpen={gameStage === "aiFeedback"}
        onClose={handleAIClose}
        explanation={aiTutorExplanation}
        newLevel={currentMaxNumber}
      />
    </div>
  );
}
