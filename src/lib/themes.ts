
// src/lib/themes.ts
export interface ThemeBlockImage {
  basePlaceholderUrl: string; // e.g., "https://placehold.co/30x30"
  color: string; // hex color for placeholder background
  textColor: string; // hex color for placeholder text (if any, try to make it same as bg to hide text)
  alt: string;
  aiHint: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  oneBlock: ThemeBlockImage;
  tenUnitBlock: ThemeBlockImage; // The individual unit that makes up a "ten" stack
  tensGroupClasses?: string; // Tailwind classes for the container of ten-stacks
  onesGroupClasses?: string; // Tailwind classes for the container of one-units
}

export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Classic Blocks",
    description: "The original blocky fun!",
    oneBlock: {
      basePlaceholderUrl: "https://placehold.co/35x35",
      color: "FFD700", // Yellow
      textColor: "FFD700",
      alt: "One block (yellow cube)",
      aiHint: "cube yellow",
    },
    tenUnitBlock: {
      basePlaceholderUrl: "https://placehold.co/35x35",
      color: "3BA9D9", // Blue
      textColor: "3BA9D9",
      alt: "Part of a ten stack (blue cube)",
      aiHint: "cube blue",
    },
    tensGroupClasses: "p-1 bg-primary/10 rounded shadow-md",
    onesGroupClasses: "p-0.5 bg-accent/10 rounded shadow-md",
  },
  {
    id: "fruits",
    name: "Fruity Fun",
    description: "Count yummy fruits!",
    oneBlock: {
      basePlaceholderUrl: "https://placehold.co/40x40",
      color: "FF6347", // Tomato red (apple)
      textColor: "FF6347",
      alt: "Single apple",
      aiHint: "apple fruit",
    },
    tenUnitBlock: {
      basePlaceholderUrl: "https://placehold.co/40x40",
      color: "32CD32", // Lime green (lime/grape)
      textColor: "32CD32",
      alt: "Single lime (part of a bunch)",
      aiHint: "lime fruit",
    },
    tensGroupClasses: "p-1 bg-green-600/20 rounded-lg shadow-lg",
    onesGroupClasses: "p-0.5 bg-red-500/20 rounded-lg shadow-md",
  },
  {
    id: "stars",
    name: "Starry Night",
    description: "Reach for the stars!",
    oneBlock: {
      basePlaceholderUrl: "https://placehold.co/40x40",
      color: "FFEB3B", // Bright Yellow (star)
      textColor: "FFEB3B",
      alt: "Single star",
      aiHint: "star shiny",
    },
    tenUnitBlock: {
      basePlaceholderUrl: "https://placehold.co/40x40",
      color: "9C27B0", // Purple (cosmic dust for ten-group)
      textColor: "9C27B0",
      alt: "Single cosmic particle (part of a cluster)",
      aiHint: "star cluster",
    },
    tensGroupClasses: "p-1 bg-purple-700/30 rounded-full shadow-xl",
    onesGroupClasses: "p-0.5 bg-yellow-400/30 rounded-full shadow-md",
  },
];

export const DEFAULT_THEME_ID = THEMES[0].id;
