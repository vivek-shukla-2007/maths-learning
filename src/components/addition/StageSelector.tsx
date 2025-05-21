
"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import type { AdditionStage } from '@/lib/constants'; // Assuming type definition in constants

interface StageSelectorProps {
  stages: AdditionStage[];
  onStageSelect: (stageId: string) => void;
  disabled: boolean;
}

export function StageSelector({ 
  stages,
  onStageSelect, 
  disabled,
}: StageSelectorProps): React.JSX.Element {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-primary">Choose Your Challenge!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {stages.map((stage) => (
          <Button
            key={stage.id}
            variant="outline"
            size="lg"
            className="w-full text-lg py-6"
            onClick={() => onStageSelect(stage.id)}
            disabled={disabled}
          >
            {stage.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
