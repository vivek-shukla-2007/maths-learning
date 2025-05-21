
"use client";

import type * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { LEVELS } from '@/lib/constants';
import type { Theme } from '@/lib/themes'; // THEME Import

interface LevelSelectorProps {
  onLevelSelect: (maxNumber: number) => void;
  disabled: boolean;
  themes: Theme[]; // THEME Prop
  selectedThemeId: string; // THEME Prop
  onThemeSelect: (themeId: string) => void; // THEME Prop
}

export function LevelSelector({ 
  onLevelSelect, 
  disabled,
  themes,
  selectedThemeId,
  onThemeSelect
}: LevelSelectorProps): React.JSX.Element {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-primary">Choose Your Challenge!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2 text-center">Select a Level:</p>
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

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground mb-3 text-center">Select a Theme:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themes.map((theme) => (
              <Button
                key={theme.id}
                variant={selectedThemeId === theme.id ? "default" : "outline"}
                onClick={() => onThemeSelect(theme.id)}
                disabled={disabled}
                className="h-auto py-3 flex flex-col items-center justify-center text-center"
              >
                <div className="flex items-center justify-center mb-1">
                  {selectedThemeId === theme.id && <Check className="h-4 w-4 mr-2" />}
                  <span className="font-semibold">{theme.name}</span>
                </div>
                <p className="text-xs text-muted-foreground px-1">{theme.description}</p>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
