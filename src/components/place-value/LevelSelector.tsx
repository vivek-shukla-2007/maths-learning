
"use client";

import type * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { LEVELS } from '@/lib/constants';

interface LevelSelectorProps {
  onLevelSelect: (maxNumber: number) => void;
  disabled: boolean;
}

export function LevelSelector({ 
  onLevelSelect, 
  disabled,
}: LevelSelectorProps): React.JSX.Element {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-primary">Choose Your Challenge!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2 text-center">Select a Max Number for Questions:</p>
          <Select
            onValueChange={(value) => onLevelSelect(parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger className="w-full text-lg py-6">
              <SelectValue placeholder="Select a level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((level) => (
                <SelectItem key={level.max} value={level.max.toString()} className="text-lg">
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
