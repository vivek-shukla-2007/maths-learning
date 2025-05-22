
"use client";

import type * as React from 'react';
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
import { Loader2, LayoutGrid, ListRestart, ThumbsUp, XCircle } from 'lucide-react';
import { QUESTIONS_PER_BATCH, MIN_LEVEL_MAX_VALUE, MAX_LEVEL_MAX_VALUE, LEVELS } from '@/lib/constants';


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

  const enableGenKit = process.env.NEXT_PUBLIC_ENABLE_GENKIT === 'true';

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
    setScore({ correct: 0, total: 0 });
    generateNewQuestion(levelMax);
  };

  const handleGameMenu = () => {
    setGameStage("levelSelection");
    setScore({ correct: 0, total: 0 });
    setCurrentMaxNumber(LEVELS[0].max); 
  };

  const proceedToNextStep = useCallback(() => {
    // Check if it's time for AI evaluation
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
      // User stays on the same question to retry
      setTimeout(() => {
        setFeedbackAnimation(null);
      }, 1200); 
    }
  };
  
  const handleShowHint = () => {
    let hintDescription = `Look carefully! There are ${tens} ${tens === 1 ? "ten" : "tens"} and ${ones} ${ones === 1 ? "one" : "ones"}.`;
    if (tens === 0 && ones > 0) {
        hintDescription = `Look carefully! There are ${ones} ${ones === 1 ? "one" : "ones"}.`;
    } else if (ones === 0 && tens > 0) {
        hintDescription = `Look carefully! There are ${tens} ${tens === 1 ? "ten" : "tens"}.`;
    } else if (tens === 0 && ones === 0) { 
        hintDescription = `Count the blocks!`;
    }

    toast({
      title: "Hint!",
      description: hintDescription,
      duration: 2000, 
    });
  };

  useEffect(() => {
    if (gameStage === "evaluatingAI") {
      if (enableGenKit) {
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
            toast({ title: "AI Tutor Error", description: "Could not get feedback. Continuing with current level.", variant: "destructive", duration: 3000 });
            setScore({ correct: 0, total: 0 });
            generateNewQuestion(currentMaxNumber); 
          } finally {
            setIsLoadingAI(false);
          }
        };
        callAI();
      } else {
        // GenKit is disabled, skip AI evaluation and proceed
        toast({ title: "AI Tutor Disabled", description: "Continuing with current level.", duration: 2000 });
        setScore({ correct: 0, total: 0 }); // Reset batch score
        generateNewQuestion(currentMaxNumber); // Proceed to next question at current level
      }
    }
  }, [gameStage, currentMaxNumber, lastSelectedAnswerForAI, lastCorrectAnswerForAI, score, toast, generateNewQuestion, enableGenKit]);

  const handleAIClose = () => {
    generateNewQuestion(currentMaxNumber);
  };

  useEffect(() => {
    document.title = 'Place Value Puzzles';
  }, []);

  if (isLoadingAI && enableGenKit) { // Only show loader if GenKit is enabled and loading
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">Our AI Tutor is thinking...</p>
      </div>
    );
  }
  
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
              disabled={(gameStage === "answered" && selectedAnswer === targetNumber) || gameStage === "evaluatingAI"}
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

      {enableGenKit && (
        <AITutorDialog
            isOpen={gameStage === "aiFeedback"}
            onClose={handleAIClose}
            explanation={aiTutorExplanation}
            newLevel={currentMaxNumber}
        />
      )}
    </div>
  );
}

