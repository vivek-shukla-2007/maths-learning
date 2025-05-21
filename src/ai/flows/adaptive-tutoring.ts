// src/ai/flows/adaptive-tutoring.ts
'use server';
/**
 * @fileOverview This file defines the adaptive tutoring flow for adjusting question difficulty based on student performance.
 *
 * - adaptiveTutoring - A function that handles the adaptive tutoring process.
 * - AdaptiveTutoringInput - The input type for the adaptiveTutoring function.
 * - AdaptiveTutoringOutput - The return type for the adaptiveTutoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveTutoringInputSchema = z.object({
  level: z
    .number()
    .describe('The current difficulty level (e.g., 1-9, 1-19, ..., 1-99).'),
  studentAnswer: z.number().describe('The student answer to the current question.'),
  correctAnswer: z.number().describe('The correct answer to the current question.'),
  score: z.string().describe('The current score (e.g., 9 out of 10 was correct).'),
});
export type AdaptiveTutoringInput = z.infer<typeof AdaptiveTutoringInputSchema>;

const AdaptiveTutoringOutputSchema = z.object({
  nextLevel: z
    .number()
    .describe(
      'The next difficulty level, adjusted based on the student performance.  If the level is fine, return the same level as the input.  If the student needs to review, return a lower number.  If the student is doing well, return a higher number.  The level should be within the range of 1-9 to 1-99.'
    ),
  explanation: z.string().describe('Explanation to why the difficulty was adjusted.'),
});
export type AdaptiveTutoringOutput = z.infer<typeof AdaptiveTutoringOutputSchema>;

export async function adaptiveTutoring(input: AdaptiveTutoringInput): Promise<AdaptiveTutoringOutput> {
  return adaptiveTutoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveTutoringPrompt',
  input: {schema: AdaptiveTutoringInputSchema},
  output: {schema: AdaptiveTutoringOutputSchema},
  prompt: `You are an AI tutor that adjusts the difficulty of place value questions for students.

You are given the current level, the student's answer, the correct answer, and the student's score.

Based on this information, determine the next appropriate level for the student. If the student is struggling, reduce the difficulty. If the student is doing well, increase the difficulty. If the student is performing adequately, maintain the current level. The level should be within the range of 1-9 to 1-99.

Generate a short explanation of why you adjusted the difficulty.

Current Level: {{{level}}}
Student's Answer: {{{studentAnswer}}}
Correct Answer: {{{correctAnswer}}}
Score: {{{score}}}

Output in JSON format:
{{output}}`,
});

const adaptiveTutoringFlow = ai.defineFlow(
  {
    name: 'adaptiveTutoringFlow',
    inputSchema: AdaptiveTutoringInputSchema,
    outputSchema: AdaptiveTutoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
