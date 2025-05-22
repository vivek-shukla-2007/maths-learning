
export const LEVELS = [
  { label: "Numbers up to 9", max: 9, min: 1 },
  { label: "Numbers up to 19", max: 19, min: 1 },
  { label: "Numbers up to 29", max: 29, min: 1 },
  { label: "Numbers up to 39", max: 39, min: 1 },
  { label: "Numbers up to 49", max: 49, min: 1 },
  { label: "Numbers up to 59", max: 59, min: 1 },
  { label: "Numbers up to 69", max: 69, min: 1 },
  { label: "Numbers up to 79", max: 79, min: 1 },
  { label: "Numbers up to 89", max: 89, min: 1 },
  { label: "Numbers up to 99", max: 99, min: 1 },
];

export const QUESTIONS_PER_BATCH = 5; // Number of questions before AI tutor evaluation
export const MIN_LEVEL_MAX_VALUE = 9;
export const MAX_LEVEL_MAX_VALUE = 99;


// Constants for Addition Adventure
export interface AdditionStage {
  id: string;
  name: string;
  minOperandValue: number;
  maxOperandValue: number;
  description?: string;
}

export const ADDITION_STAGES: AdditionStage[] = [
  {
    id: 'add-visual',
    name: 'Stage 1: Visual Counting (Sums up to 10)',
    minOperandValue: 1,
    maxOperandValue: 9, // Max sum 10, so 9+1 or 5+5 etc.
    description: 'Count the stars to find the sum!'
  },
  {
    id: 'add-numbers',
    name: 'Stage 2: Numbers Only (Sums up to 19)',
    minOperandValue: 0, // Allow 0+X
    maxOperandValue: 10, // A single operand can be up to 10. If one is 10, other is 0-9.
    description: 'Add the numbers together.'
  },
  {
    id: 'add-carry',
    name: 'Stage 3: Column Addition (Carry)',
    minOperandValue: 1, 
    maxOperandValue: 99,
    description: 'Practice addition with carrying. Input the sum and carry digits.'
  },
];

// Constants for Subtraction Sprints
export interface SubtractionStage {
  id: string;
  name: string;
  maxMinuend: number; // Max value for the number being subtracted from
  description?: string;
}

export const SUBTRACTION_STAGES: SubtractionStage[] = [
  {
    id: 'sub-visual',
    name: 'Stage 1: Visual Subtraction (Up to 10)',
    maxMinuend: 10,
    description: 'Count and take away items.'
  },
  {
    id: 'sub-numbers',
    name: 'Stage 2: Numbers Only (Minuend up to 10)',
    maxMinuend: 10, // << UPDATED
    description: 'Subtract the numbers.'
  },
  {
    id: 'sub-borrow',
    name: 'Stage 3: Column Subtraction (Borrowing)',
    maxMinuend: 99, // For two-digit subtraction
    description: 'Practice subtraction with borrowing. Input the difference.'
  },
];

