
'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing a shopping cart within a given budget.
 *
 * - optimizeCartWithinBudget - A function that takes cart items, a product catalog, and a budget, and returns an optimized list of items.
 * - OptimizeCartInput - The input type for the optimizeCartWithinBudget function.
 * - OptimizeCartOutput - The return type for the optimizeCartWithinBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeCartInputSchema = z.object({
  cartItems: z.string().describe('A JSON string representing the list of items currently in the cart.'),
  allProducts: z.string().describe('A JSON string representing the full catalog of available products.'),
  budget: z.number().describe('The total budget for the cart.'),
  userPreferences: z.string().optional().describe('User preferences for optimization (e.g., "prioritize rating over price").'),
});
export type OptimizeCartInput = z.infer<typeof OptimizeCartInputSchema>;

const OptimizeCartOutputSchema = z.object({
  optimizedCart: z.string().describe('A JSON string representing the final optimized cart, containing kept and newly added items.'),
  removedItems: z.string().describe('A JSON string representing the items removed from the original cart.'),
  reasoning: z.string().describe('A summary of why the changes were made.'),
});
export type OptimizeCartOutput = z.infer<typeof OptimizeCartOutputSchema>;


export async function optimizeCartWithinBudget(input: OptimizeCartInput): Promise<OptimizeCartOutput> {
  return optimizeCartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCartPrompt',
  input: {schema: OptimizeCartInputSchema},
  output: {schema: OptimizeCartOutputSchema},
  prompt: `You are an expert shopping assistant. Your goal is to optimize a user's shopping cart to provide the best value within a given budget. You can achieve this by keeping items, swapping items for better alternatives from the same category, or removing items altogether.

The user's budget is: {{budget}}.

The user's current cart contains the following items (JSON string):
{{{cartItems}}}

The full catalog of available products is (JSON string):
{{{allProducts}}}

Your task is to solve this as a variation of the 0/1 Knapsack Problem.
1.  Define a "value score" for each item (both in the cart and in the catalog). This score should be a blend of the product's rating and its price. Higher-rated and lower-priced items have better scores.
2.  Your goal is to find the combination of items that maximizes the total value score while ensuring the total cost does not exceed the budget.
3.  You must consider swapping items in the cart with other items from the *same category* in the full product catalog if the swap results in a better overall value score and fits the budget.
4.  If an item in the cart is low value or removing it is necessary to meet the budget, you should suggest its removal.

Your response MUST be in the specified JSON format.
- 'optimizedCart': A JSON stringified array of all items that should be in the final cart (both items kept and new items added). Include a 'reason' for each item.
- 'removedItems': A JSON stringified array of items from the original cart that were either removed or swapped out. Include a 'reason' for each removal/swap.
- 'reasoning': A high-level summary of your optimization strategy.

Do not invent products or properties. Only use products from the provided catalog.
`,
});

const optimizeCartFlow = ai.defineFlow(
  {
    name: 'optimizeCartFlow',
    inputSchema: OptimizeCartInputSchema,
    outputSchema: OptimizeCartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
