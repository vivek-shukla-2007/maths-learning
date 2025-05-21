"use client";

import Image from 'next/image';
import type * as React from 'react';

interface BlockDisplayProps {
  tens: number;
  ones: number;
}

export function BlockDisplay({ tens, ones }: BlockDisplayProps): React.JSX.Element {
  const tenBlocks = Array(tens).fill(0);
  const oneBlocks = Array(ones).fill(0);

  return (
    <div className="my-6 p-4 bg-secondary/30 rounded-lg shadow-inner min-h-[150px] flex flex-col items-center justify-center">
      {tens > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-center text-primary mb-2">Tens</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {tenBlocks.map((_, index) => (
              <div key={`ten-${index}`} className="bg-primary rounded p-1 shadow-md" data-ai-hint="ten blocks group">
                <Image
                  src="https://placehold.co/100x25/29ABE2/FFFFFF?text=TEN"
                  alt="Ten block"
                  width={100}
                  height={25}
                  className="rounded"
                  data-ai-hint="ten block"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {ones > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-center text-accent-foreground mb-2">Ones</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {oneBlocks.map((_, index) => (
              <div key={`one-${index}`} className="bg-accent rounded p-1 shadow-md" data-ai-hint="one block item">
                <Image
                  src="https://placehold.co/25x25/FFDA63/333333?text=ONE"
                  alt="One block"
                  width={25}
                  height={25}
                  className="rounded"
                  data-ai-hint="one block"
                />
              </div>
            ))}
          </div>
        </div>
      )}
       {(tens === 0 && ones === 0) && (
        <p className="text-muted-foreground">Blocks will appear here!</p>
      )}
    </div>
  );
}
