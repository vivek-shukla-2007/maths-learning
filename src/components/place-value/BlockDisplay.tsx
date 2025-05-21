
"use client";

import Image from 'next/image';
import type * as React from 'react';

interface BlockDisplayProps {
  tens: number;
  ones: number;
}

export function BlockDisplay({ tens, ones }: BlockDisplayProps): React.JSX.Element {
  const oneBlocks = Array(ones).fill(0);

  return (
    <div className="my-6 p-4 bg-secondary/30 rounded-lg shadow-inner min-h-[300px] flex flex-col items-center justify-center space-y-4">
      {tens > 0 && (
        <div className="w-full">
          {/* Removed "Tens" h3 title */}
          <div className="flex flex-wrap justify-center items-end gap-2"> {/* Horizontal layout for multiple tens bars */}
            {Array.from({ length: tens }).map((_, tenIndex) => (
              <div key={`ten-group-${tenIndex}`} className="flex flex-col items-center gap-0.5 p-1 bg-primary rounded shadow-md" data-ai-hint="tens stack"> {/* Stack 10 "one" blocks vertically, with primary bg */}
                {Array.from({ length: 10 }).map((_, oneIndex) => (
                  <Image
                    key={`ten-${tenIndex}-one-${oneIndex}`}
                    src="https://placehold.co/25x25.png" 
                    alt="Part of a ten block"
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
        <div className="w-full">
          {/* Removed "Ones" h3 title */}
          <div className="flex flex-wrap justify-center items-end gap-2">
            {oneBlocks.map((_, index) => (
              <div key={`one-${index}`} className="bg-accent rounded p-1 shadow-md" data-ai-hint="ones unit"> {/* Individual one block with accent bg */}
                <Image
                  src="https://placehold.co/25x25.png"
                  alt="One block cube"
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
       {(tens === 0 && ones === 0) && (
        <p className="text-muted-foreground">Select a level to see the blocks!</p>
      )}
    </div>
  );
}
