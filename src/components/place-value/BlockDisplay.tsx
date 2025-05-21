
"use client";

import Image from 'next/image';
import type * as React from 'react';
import { cn } from '@/lib/utils';

interface BlockDisplayProps {
  tens: number;
  ones: number;
}

const BLOCKS_PER_ROW_FOR_ONES = 3;

// Default block appearance
const defaultOneBlock = {
  basePlaceholderUrl: "https://placehold.co",
  imageWidth: 35,
  imageHeight: 35,
  color: "FFD700", // Yellow
  textColor: "FFD700", // Match to hide text
  alt: "One block",
  aiHint: "cube yellow",
  groupClasses: "p-0.5 bg-accent/10 rounded shadow-md",
};

const defaultTenUnitBlock = {
  basePlaceholderUrl: "https://placehold.co",
  imageWidth: 30,
  imageHeight: 30,
  color: "3BA9D9", // Blue
  textColor: "3BA9D9", // Match to hide text
  alt: "Part of a ten stack",
  aiHint: "cube blue",
  groupClasses: "p-1 bg-primary/10 rounded shadow-md",
};


export function BlockDisplay({ tens, ones }: BlockDisplayProps): React.JSX.Element {
  
  const getImageUrl = (blockConfig: typeof defaultOneBlock | typeof defaultTenUnitBlock) => {
    // Adding a non-displaying text query parameter to try and force solid color
    return `${blockConfig.basePlaceholderUrl}/${blockConfig.imageWidth}x${blockConfig.imageHeight}/${blockConfig.color}/${blockConfig.textColor}.png?text=+`;
  };

  const renderOneBlocks = () => {
    const rows = [];
    for (let i = 0; i < ones; i += BLOCKS_PER_ROW_FOR_ONES) {
      const rowBlocks = [];
      for (let j = 0; j < BLOCKS_PER_ROW_FOR_ONES && (i + j) < ones; j++) {
        rowBlocks.push(
          <div key={`one-${i + j}`} className={cn("rounded", defaultOneBlock.groupClasses)} data-ai-hint={defaultOneBlock.aiHint}>
            <Image
              src={getImageUrl(defaultOneBlock)}
              alt={defaultOneBlock.alt}
              width={defaultOneBlock.imageWidth}
              height={defaultOneBlock.imageHeight}
              className="rounded"
              data-ai-hint={defaultOneBlock.aiHint}
              priority={i + j < BLOCKS_PER_ROW_FOR_ONES * 2} 
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
              <div key={`ten-group-${tenIndex}`} className={cn("flex flex-col items-center gap-0.5", defaultTenUnitBlock.groupClasses)} data-ai-hint={defaultTenUnitBlock.aiHint + " stack"}>
                {Array.from({ length: 10 }).map((_, oneIndex) => (
                  <Image
                    key={`ten-${tenIndex}-one-${oneIndex}`}
                    src={getImageUrl(defaultTenUnitBlock)}
                    alt={defaultTenUnitBlock.alt}
                    width={defaultTenUnitBlock.imageWidth}
                    height={defaultTenUnitBlock.imageHeight}
                    className="rounded"
                    data-ai-hint={defaultTenUnitBlock.aiHint}
                    priority={tenIndex < 1 && oneIndex < 5} 
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
        <p className="text-muted-foreground">Select a level to see the blocks!</p>
      )}
    </div>
  );
}
