
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
  maxOperandValue: number; // For Stage 2, this will be 10. Problem generation will handle the "10+9" rule.
  description?: string;
}

export const ADDITION_STAGES: AdditionStage[] = [
  {
    id: 'add-visual',
    name: 'Stage 1: Visual Counting (1-9)',
    minOperandValue: 1,
    maxOperandValue: 9, // Max value for each operand here
    description: 'Count the stars to find the sum!'
  },
  {
    id: 'add-numbers',
    name: 'Stage 2: Numbers Only (Sums up to 19)',
    minOperandValue: 0, // Can be 0 for problems like 0+5
    maxOperandValue: 10, // Max value for a single operand
    description: 'Add the numbers together.'
  },
  {
    id: 'add-carry',
    name: 'Stage 3: Column Addition (Carry)',
    minOperandValue: 1,
    maxOperandValue: 20, // Max value for one of the operands, ensuring sums are manageable
    description: 'Practice addition with carrying.'
  },
];
