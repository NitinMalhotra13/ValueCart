
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative products or product bundles to save money.
 *
 * - getAlternativeProductSuggestions - A function that takes a product description and returns alternative suggestions.
 * - GetAlternativeProductSuggestionsInput - The input type for the getAlternativeProductSuggestions function.
 * - GetAlternativeProductSuggestionsOutput - The return type for the getAlternativeProductSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Product } from '@/lib/types';


const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  rating: z.number(),
  imageUrl: z.string(),
  imageHint: z.string(),
  description: z.string(),
  category: z.string(),
  specifications: z.string(),
});

const GetAlternativeProductSuggestionsInputSchema = z.object({
  productDescription: z.string().describe('The description of the product for which alternatives are desired.'),
  userPreferences: z.string().optional().describe('Optional user preferences to tailor the suggestions.'),
  products: z.array(ProductSchema).describe('The list of all available products in the store.'),
});
export type GetAlternativeProductSuggestionsInput = z.infer<typeof GetAlternativeProductSuggestionsInputSchema>;

const SuggestionSchema = ProductSchema.extend({
  reason: z.string().describe('Reason for suggesting this product (e.g., cheaper, bundle).'),
});

const GetAlternativeProductSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('List of alternative product suggestions.'),
});
export type GetAlternativeProductSuggestionsOutput = z.infer<typeof GetAlternativeProductSuggestionsOutputSchema>;

export async function getAlternativeProductSuggestions(input: GetAlternativeProductSuggestionsInput): Promise<GetAlternativeProductSuggestionsOutput> {
  return getAlternativeProductSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAlternativeProductSuggestionsPrompt',
  input: {schema: GetAlternativeProductSuggestionsInputSchema},
  output: {schema: GetAlternativeProductSuggestionsOutputSchema},
  prompt: `You are an AI Bargain Buddy, designed to suggest cheaper alternatives or product bundles to help users save money.

You have been provided with a catalog of products available in the store. Your suggestions must be based ONLY on the products from this list. Do not invent products or prices.

Here is the list of available products:
{{#each products}}
- ID: {{this.id}}, Name: {{this.name}}, Price: {{this.price}}, Description: {{this.description}}, Category: {{this.category}}, Rating: {{this.rating}}, ImageURL: {{this.imageUrl}}, ImageHint: {{this.imageHint}}, Specifications: {{this.specifications}}
{{/each}}

Based on the user's request, find cheaper alternatives from the list above.

User's request:
"{{productDescription}}"

{% if userPreferences %}
Also consider the following user preferences: {{userPreferences}}
{% endif %}

Suggest alternative products or bundles from the provided list that are cheaper or offer better value. Provide a reason for each suggestion.
Return a maximum of three suggestions.
Format your output as a JSON array of product suggestions, including ALL fields for the product (id, name, description, price, rating, imageUrl, imageHint, category, specifications) and the reason.
Ensure the output is valid JSON.
`,
});

const getAlternativeProductSuggestionsFlow = ai.defineFlow(
  {
    name: 'getAlternativeProductSuggestionsFlow',
    inputSchema: GetAlternativeProductSuggestionsInputSchema,
    outputSchema: GetAlternativeProductSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

