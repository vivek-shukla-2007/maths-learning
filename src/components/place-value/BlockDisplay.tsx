
"use client";

import Image from 'next/image';
import type * as React from 'react';

interface BlockDisplayProps {
  tens: number;
  ones: number;
}

const TENS_BLOCK_COLOR_BG = "3BA9D9"; 
const ONES_BLOCK_COLOR_BG = "FFD700"; 
const TENS_BLOCK_COLOR_FG = TENS_BLOCK_COLOR_BG;
const ONES_BLOCK_COLOR_FG = ONES_BLOCK_COLOR_BG;

const BLOCKS_PER_ROW_FOR_ONES = 3;

export function BlockDisplay({ tens, ones }: BlockDisplayProps): React.JSX.Element {
  
  const renderOneBlocks = () => {
    const rows = [];
    for (let i = 0; i < ones; i += BLOCKS_PER_ROW_FOR_ONES) {
      const rowBlocks = [];
      for (let j = 0; j < BLOCKS_PER_ROW_FOR_ONES && (i + j) < ones; j++) {
        rowBlocks.push(
          <div key={`one-${i + j}`} className="bg-accent/20 rounded p-0.5 shadow-md" data-ai-hint="ones unit">
            <Image
              src={`https://placehold.co/25x25/${ONES_BLOCK_COLOR_BG}/${ONES_BLOCK_COLOR_FG}.png`}
              alt="One block cube (yellow)"
              width={25}
              height={25}
              className="rounded"
              data-ai-hint="cube one"
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
    <div className="my-6 p-4 bg-secondary/30 rounded-lg shadow-inner min-h-[350px] flex flex-col items-center justify-center space-y-4">
      {/* Tens display */}
      {tens > 0 && (
        <div className="w-full">
          <div className="flex flex-wrap justify-center items-end gap-3">
            {Array.from({ length: tens }).map((_, tenIndex) => (
              <div key={`ten-group-${tenIndex}`} className="flex flex-col items-center gap-0.5 p-1 bg-primary/20 rounded shadow-md" data-ai-hint="tens stack">
                {Array.from({ length: 10 }).map((_, oneIndex) => (
                  <Image
                    key={`ten-${tenIndex}-one-${oneIndex}`}
                    src={`https://placehold.co/25x25/${TENS_BLOCK_COLOR_BG}/${TENS_BLOCK_COLOR_FG}.png`}
                    alt="Part of a ten block stack (blue)"
                    width={25}
                    height={25}
                    className="rounded"
                    data-ai-hint="cube ten" 
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Ones display */}
      {ones > 0 && (
        <div className="w-full mt-2">
          {renderOneBlocks()}
        </div>
      )}
       {(tens === 0 && ones === 0 && typeof window !== 'undefined') && (
        <p className="text-muted-foreground">Select a level to see the blocks!</p>
      )}
    </div>
  );
}
