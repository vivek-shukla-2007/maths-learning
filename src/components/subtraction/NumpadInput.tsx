
"use client";

import type * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eraser, Lightbulb } from 'lucide-react'; 
import { cn } from "@/lib/utils";

interface NumpadInputProps {
  onDigitPress: (digit: string) => void;
  onClearPress: () => void;
  onSubmitPress: () => void;
  onShowHint?: () => void; 
  showHintButton?: boolean; 
  disabled?: boolean;
  className?: string;
}

const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function NumpadInput({
  onDigitPress,
  onClearPress,
  onSubmitPress,
  onShowHint,
  showHintButton = false,
  disabled = false,
  className,
}: NumpadInputProps): React.JSX.Element {
  return (
    <Card className={cn("w-full max-w-xs shadow-lg", className)}>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {digits.map((digit) => (
            <Button
              key={digit}
              variant="outline"
              className={cn(
                "text-2xl h-14",
                digit === "0" && "col-span-1" 
              )}
              onClick={() => onDigitPress(digit)}
              disabled={disabled}
            >
              {digit}
            </Button>
          ))}
           <Button
            variant="outline"
            className="text-xl h-14 flex items-center justify-center col-span-1" // Adjusted for 0 taking one spot
            onClick={onClearPress}
            disabled={disabled}
            aria-label="Clear input"
          >
            <Eraser className="h-6 w-6" />
          </Button>
        </div>
        <Button
          variant="default"
          size="lg"
          className="w-full text-lg h-14"
          onClick={onSubmitPress}
          disabled={disabled}
        >
          Submit
        </Button>
        {showHintButton && onShowHint && (
          <div className="flex justify-center items-center pt-2">
            <Button 
              variant="ghost" 
              onClick={onShowHint} 
              disabled={disabled}
              className="text-accent-foreground hover:text-accent"
            >
              <Lightbulb className="mr-2 h-5 w-5" /> Hint
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
