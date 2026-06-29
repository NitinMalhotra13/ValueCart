'use server';

/**
 * @fileOverview A personalized product recommendation AI agent.
 *
 * - receivePersonalizedRecommendations - A function that returns product recommendations.
 * - ReceivePersonalizedRecommendationsInput - The input type for the receivePersonalizedRecommendations function.
 * - ReceivePersonalizedRecommendationsOutput - The return type for the receivePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceivePersonalizedRecommendationsInputSchema = z.object({
  userId: z.string().describe('The ID of the user to generate recommendations for.'),
});
export type ReceivePersonalizedRecommendationsInput = z.infer<
  typeof ReceivePersonalizedRecommendationsInputSchema
>;

const ReceivePersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      productId: z.string().describe('The ID of the recommended product.'),
      reason: z.string().describe('The reason why this product was recommended.'),
    })
  ).describe('A list of personalized product recommendations.'),
});
export type ReceivePersonalizedRecommendationsOutput = z.infer<
  typeof ReceivePersonalizedRecommendationsOutputSchema
>;

export async function receivePersonalizedRecommendations(
  input: ReceivePersonalizedRecommendationsInput
): Promise<ReceivePersonalizedRecommendationsOutput> {
  return receivePersonalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'receivePersonalizedRecommendationsPrompt',
  input: {schema: ReceivePersonalizedRecommendationsInputSchema},
  output: {schema: ReceivePersonalizedRecommendationsOutputSchema},
  prompt: `You are a personal shopping assistant. Generate personalized product recommendations for the user with ID {{{userId}}}.

Consider their past behavior, preferences, and purchase history to suggest products they might be interested in. Explain the reason for each recommendation.

Output a JSON array of product recommendations, including the product ID and the reason for the recommendation.`,
});

const receivePersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'receivePersonalizedRecommendationsFlow',
    inputSchema: ReceivePersonalizedRecommendationsInputSchema,
    outputSchema: ReceivePersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
