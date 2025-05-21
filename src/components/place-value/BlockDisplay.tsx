
"use client";

import Image from 'next/image';
import type * as React from 'react';

interface BlockDisplayProps {
  tens: number;
  ones: number;
}

// Define base colors for blocks from placehold.co (hex without #)
// Primary-like blue for tens
const TENS_BLOCK_COLOR_BG = "3BA9D9"; // HSL(197 71% 52%) -> approx #3BA9D9
const TENS_BLOCK_COLOR_FG = "FFFFFF"; // White for any text (though not visible on small blocks)
// Accent-like yellow for ones
const ONES_BLOCK_COLOR_BG = "FFD700"; // HSL(46 100% 70%) -> approx #FFD700
const ONES_BLOCK_COLOR_FG = "000000"; // Black for any text

export function BlockDisplay({ tens, ones }: BlockDisplayProps): React.JSX.Element {
  const oneBlocks = Array(ones).fill(0);

  return (
    <div className="my-6 p-4 bg-secondary/30 rounded-lg shadow-inner min-h-[350px] flex flex-col items-center justify-center space-y-4">
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
                    data-ai-hint="cube block" 
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {ones > 0 && (
        <div className="w-full mt-2"> {/* Added margin-top if tens are also present */}
          <div className="flex flex-wrap justify-center items-end gap-2">
            {oneBlocks.map((_, index) => (
              <div key={`one-${index}`} className="bg-accent/20 rounded p-0.5 shadow-md" data-ai-hint="ones unit">
                <Image
                  src={`https://placehold.co/25x25/${ONES_BLOCK_COLOR_BG}/${ONES_BLOCK_COLOR_FG}.png`}
                  alt="One block cube (yellow)"
                  width={25}
                  height={25}
                  className="rounded"
                  data-ai-hint="cube block"
                />
              </div>
            ))}
          </div>
        </div>
      )}
       {(tens === 0 && ones === 0 && typeof window !== 'undefined') && ( // Check for window to avoid hydration issues with conditional rendering based on initial state
        <p className="text-muted-foreground">Select a level to see the blocks!</p>
      )}
    </div>
  );
}
