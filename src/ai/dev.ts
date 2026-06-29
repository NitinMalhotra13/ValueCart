
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/receive-personalized-recommendations.ts';
import '@/ai/flows/get-alternative-product-suggestions.ts';
import '@/ai/flows/simulate-bargaining-with-ai-buddy.ts';
