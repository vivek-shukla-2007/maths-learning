
"use client";

import Image from 'next/image';
import type * as React from 'react';
import type { Theme, ThemeBlockImage } from '@/lib/themes'; // THEME Import
import { cn } from '@/lib/utils';

interface BlockDisplayProps {
  tens: number;
  ones: number;
  theme: Theme; // THEME Prop
}

const BLOCKS_PER_ROW_FOR_ONES = 3;

export function BlockDisplay({ tens, ones, theme }: BlockDisplayProps): React.JSX.Element {
  
  const getImageUrl = (blockConfig: ThemeBlockImage) => {
    return `${blockConfig.basePlaceholderUrl}/${blockConfig.imageWidth}x${blockConfig.imageHeight}/${blockConfig.color}/${blockConfig.textColor}.png?text=+`;
  };

  const renderOneBlocks = () => {
    const rows = [];
    for (let i = 0; i < ones; i += BLOCKS_PER_ROW_FOR_ONES) {
      const rowBlocks = [];
      for (let j = 0; j < BLOCKS_PER_ROW_FOR_ONES && (i + j) < ones; j++) {
        rowBlocks.push(
          <div key={`one-${i + j}`} className={cn("rounded p-0.5 shadow-md", theme.onesGroupClasses)} data-ai-hint={theme.oneBlock.aiHint}>
            <Image
              src={getImageUrl(theme.oneBlock)}
              alt={theme.oneBlock.alt}
              width={theme.oneBlock.imageWidth}
              height={theme.oneBlock.imageHeight}
              className="rounded"
              data-ai-hint={theme.oneBlock.aiHint}
              priority={i + j < BLOCKS_PER_ROW_FOR_ONES * 2} // Prioritize loading first few blocks
            />
          </div>
        );
      }
      rows.push(
        <div key={`one-row-${i / BLOCKS_PER_ROW_FOR_ONES}`} className="flex flex-wrap justify-center items-end gap-2 mb-2">
          {rowBlocks}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="my-4 p-4 bg-secondary/20 rounded-lg shadow-inner min-h-[350px] flex flex-col items-center justify-center space-y-4 overflow-hidden">
      {/* Tens display */}
      {tens > 0 && (
        <div className="w-full">
          <div className="flex flex-wrap justify-center items-end gap-3">
            {Array.from({ length: tens }).map((_, tenIndex) => (
              <div key={`ten-group-${tenIndex}`} className={cn("flex flex-col items-center gap-0.5", theme.tensGroupClasses)} data-ai-hint={theme.tenUnitBlock.aiHint + " stack"}>
                {Array.from({ length: 10 }).map((_, oneIndex) => (
                  <Image
                    key={`ten-${tenIndex}-one-${oneIndex}`}
                    src={getImageUrl(theme.tenUnitBlock)}
                    alt={theme.tenUnitBlock.alt}
                    width={theme.tenUnitBlock.imageWidth}
                    height={theme.tenUnitBlock.imageHeight}
                    className="rounded"
                    data-ai-hint={theme.tenUnitBlock.aiHint}
                    priority={tenIndex < 1 && oneIndex < 5} // Prioritize loading some ten-blocks
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Ones display */}
      {ones > 0 && (
        <div className="w-full mt-3">
          {renderOneBlocks()}
        </div>
      )}
       {(tens === 0 && ones === 0 && typeof window !== 'undefined') && (
        <p className="text-muted-foreground">Select a level to see the {theme.name.toLowerCase()}!</p>
      )}
    </div>
  );
}
