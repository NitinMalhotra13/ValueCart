import { Product, CartItem } from './types';

// Interface matching the output of getAlternativeProductSuggestions
export interface Suggestion extends Product {
  reason: string;
}

export interface GetAlternativeProductSuggestionsOutput {
  suggestions: Suggestion[];
}

export interface OptimizeCartOutput {
  optimizedCart: string; // JSON string of CartItem & { reason: string }
  removedItems: string;   // JSON string of CartItem & { reason: string }
  reasoning: string;
}

/**
 * Checks if a Gemini API key is configured.
 */
function getGeminiApiKey(): string | null {
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
}

/**
 * Calls the Google Gemini 2.5 Flash API directly using fetch.
 */
async function callGemini(promptText: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is missing.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  return text;
}

/**
 * AI Bargain Buddy - Gets alternative product suggestions.
 * Tries calling Gemini if API key is present; otherwise falls back to a smart client-side matching engine.
 */
export async function getAlternativeProductSuggestions(input: {
  productDescription: string;
  products: Product[];
}): Promise<GetAlternativeProductSuggestionsOutput> {
  const apiKey = getGeminiApiKey();
  if (apiKey) {
    try {
      const prompt = `You are an AI Bargain Buddy. Analyze the user request and suggest cheaper alternatives or product bundles from the provided catalog.
      
Catalog:
${JSON.stringify(input.products.map(p => ({ id: p.id, name: p.name, price: p.price, rating: p.rating, category: p.category, description: p.description })))}

User's request: "${input.productDescription}"

Provide up to 3 alternative products from the catalog. Return a JSON object with a single field "suggestions" which is an array of products including all original fields (id, name, price, rating, imageUrl, imageHint, category, description, specifications) plus a "reason" field explaining why this is a good alternative/bargain.

JSON Format:
{
  "suggestions": [
    {
      "id": "...",
      "name": "...",
      "price": 0,
      "rating": 0,
      "imageUrl": "...",
      "imageHint": "...",
      "category": "...",
      "description": "...",
      "specifications": "...",
      "reason": "..."
    }
  ]
}`;
      const responseText = await callGemini(prompt);
      const cleanedJson = responseText.replace(/```json\s?|```/g, '').trim();
      return JSON.parse(cleanedJson) as GetAlternativeProductSuggestionsOutput;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local simulation:', err);
    }
  }

  // Local Mock/Heuristic Fallback (Great for Resume Demo when no key is set)
  return getLocalProductSuggestions(input.productDescription, input.products);
}

/**
 * Smart Local Cart Heuristic Matcher.
 */
function getLocalProductSuggestions(
  query: string,
  catalog: Product[]
): GetAlternativeProductSuggestionsOutput {
  const cleanQuery = query.toLowerCase();
  
  // 1. Identify category or keyword match
  let matchedProducts = catalog.filter(
    p =>
      p.name.toLowerCase().includes(cleanQuery) ||
      p.category.toLowerCase().includes(cleanQuery) ||
      p.description.toLowerCase().includes(cleanQuery)
  );

  // If no match, try splitting by space to match keywords
  if (matchedProducts.length === 0) {
    const keywords = cleanQuery.split(/\s+/).filter(k => k.length > 2);
    matchedProducts = catalog.filter(p =>
      keywords.some(
        k =>
          p.name.toLowerCase().includes(k) ||
          p.category.toLowerCase().includes(k) ||
          p.description.toLowerCase().includes(k)
      )
    );
  }

  // If still no match, fallback to products from a category matching the first word, or just general categories
  if (matchedProducts.length === 0) {
    matchedProducts = catalog.slice(0, 5); // default fallback
  }

  // Find the categories represented in matched products
  const categories = Array.from(new Set(matchedProducts.map(p => p.category)));
  
  // For each matched product, find a cheaper alternative in the same category
  const suggestions: Suggestion[] = [];
  
  for (const cat of categories) {
    const categoryProducts = catalog.filter(p => p.category === cat);
    
    // Sort category products by price ascending
    const sortedCheapest = [...categoryProducts].sort((a, b) => a.price - b.price);
    
    // Find the item user was looking at (if we can identify one)
    const userTarget = matchedProducts.find(p => p.category === cat);
    if (userTarget) {
      // Find cheaper items than userTarget
      const cheaperItems = sortedCheapest.filter(p => p.price < userTarget.price && p.id !== userTarget.id);
      
      if (cheaperItems.length > 0) {
        // Take the one with the highest rating among cheaper items
        const bestCheaperItem = cheaperItems.sort((a, b) => b.rating - a.rating)[0];
        suggestions.push({
          ...bestCheaperItem,
          reason: `Cheaper alternative to "${userTarget.name}" saving you ₹${(userTarget.price - bestCheaperItem.price).toLocaleString('en-IN')} with a stellar ${bestCheaperItem.rating}★ rating!`,
        });
      } else {
        // Just suggest the highest-rated item in this category
        const highestRated = [...categoryProducts].sort((a, b) => b.rating - a.rating)[0];
        if (highestRated && highestRated.id !== userTarget.id) {
          suggestions.push({
            ...highestRated,
            reason: `Highly recommended top-rated choice in ${cat} with ${highestRated.rating}★ rating.`,
          });
        }
      }
    }
    
    if (suggestions.length >= 3) break;
  }

  // General fallback if we couldn't form suggestions
  if (suggestions.length === 0) {
    const fallbackProducts = [...catalog].sort((a, b) => b.rating - a.rating).slice(0, 2);
    fallbackProducts.forEach(p => {
      suggestions.push({
        ...p,
        reason: `ValueWise top pick: Superb ${p.rating}★ rating and great overall specifications.`,
      });
    });
  }

  return { suggestions: suggestions.slice(0, 3) };
}

/**
 * Smart Cart Optimizer.
 * Tries calling Gemini if API key is present; otherwise runs a local Greedy Knapsack Solver.
 */
export async function optimizeCartWithinBudget(input: {
  cartItems: string;
  allProducts: string;
  budget: number;
  userPreferences?: string;
}): Promise<OptimizeCartOutput> {
  const apiKey = getGeminiApiKey();
  if (apiKey) {
    try {
      const prompt = `You are a Smart Cart Optimizer solving a variation of the Knapsack Problem.
Goal: Maximize rating and value scores of cart items while keeping the total cost below the budget of ₹${input.budget}.
You can swap items in the cart with better/cheaper alternatives from the same category in the product catalog, or remove low-value items.

Current Cart:
${input.cartItems}

Product Catalog:
${input.allProducts}

User Preferences: ${input.userPreferences || "None"}

Optimize this cart. Return a JSON object with exactly:
- "optimizedCart": JSON string of the final items to keep in the cart (format: [{productId, name, price, imageUrl, imageHint, quantity, reason}]).
- "removedItems": JSON string of the items that were in the original cart but are now removed/swapped out (format: [{productId, name, price, imageUrl, imageHint, quantity, reason}]).
- "reasoning": A high-level summary of your optimization strategy.

JSON Format:
{
  "optimizedCart": "[{\\\"productId\\\":\\\"...\\\",\\\"name\\\":\\\"...\\\",\\\"price\\\":100,\\\"quantity\\\":1,\\\"reason\\\":\\\"...\\\"}]",
  "removedItems": "[{\\\"productId\\\":\\\"...\\\",\\\"name\\\":\\\"...\\\",\\\"price\\\":100,\\\"quantity\\\":1,\\\"reason\\\":\\\"...\\\"}]",
  "reasoning": "..."
}`;
      const responseText = await callGemini(prompt);
      const cleanedJson = responseText.replace(/```json\s?|```/g, '').trim();
      return JSON.parse(cleanedJson) as OptimizeCartOutput;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local optimization algorithm:', err);
    }
  }

  // Run Local Greedy Knapsack Solver (Excellent resume-ready algorithm!)
  return runLocalCartOptimization(input.cartItems, input.allProducts, input.budget);
}

/**
 * Greedy Knapsack Solver for Cart Optimization.
 * Swaps items for higher-rated/cheaper alternatives in the same category, and trims the cart if budget is exceeded.
 */
function runLocalCartOptimization(
  cartItemsJson: string,
  allProductsJson: string,
  budget: number
): OptimizeCartOutput {
  const cart: CartItem[] = JSON.parse(cartItemsJson);
  const catalog: Product[] = JSON.parse(allProductsJson);

  const optimizedItems: (CartItem & { reason: string })[] = [];
  const removedItems: (CartItem & { reason: string })[] = [];
  let strategy = '';

  // Helper mapping to find products quickly
  const productMap = new Map(catalog.map(p => [p.id, p]));

  // Track total cost
  let currentTotalCost = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 1. Swap Optimization Step (Local Category Upgrades & Savings)
  // For each item in the cart, check if we can swap it with a better value alternative in the same category
  const workingCart = cart.map(item => {
    const originalProduct = productMap.get(item.productId);
    if (!originalProduct) return { ...item, originalPrice: item.price, originalRating: 4.0 };

    const category = originalProduct.category;
    // Find all products in the same category
    const categoryAlternatives = catalog.filter(p => p.category === category && p.id !== item.productId);

    // Look for a product with a higher rating AND lower or slightly higher price that fits better
    // Value ratio = rating / price
    const originalRatio = originalProduct.rating / originalProduct.price;

    let bestSwap: Product | null = null;
    let maxSwapScoreDiff = 0;

    for (const alt of categoryAlternatives) {
      const altRatio = alt.rating / alt.price;
      const scoreDiff = altRatio - originalRatio;

      // Swap if the alternative has:
      // - A lower price AND a higher or similar rating (ideal save)
      // - OR a significantly higher rating for similar price
      if (alt.price < originalProduct.price && alt.rating >= originalProduct.rating - 0.2) {
        if (scoreDiff > maxSwapScoreDiff) {
          maxSwapScoreDiff = scoreDiff;
          bestSwap = alt;
        }
      }
    }

    if (bestSwap) {
      const savings = originalProduct.price - bestSwap.price;
      strategy += `Swapped "${item.name}" with "${bestSwap.name}" to save ₹${savings.toLocaleString('en-IN')} while maintaining a high ${bestSwap.rating}★ rating. `;
      return {
        id: item.id,
        productId: bestSwap.id,
        name: bestSwap.name,
        price: bestSwap.price,
        imageUrl: bestSwap.imageUrl,
        imageHint: bestSwap.imageHint,
        quantity: item.quantity,
        reason: `Value upgrade: Saved ₹${savings.toLocaleString('en-IN')} over ${item.name} with similar quality.`,
        swappedFrom: item,
      };
    }

    return {
      ...item,
      reason: `Kept "${item.name}" because it offers high rating (${originalProduct.rating}★) and fits the value profile.`,
      swappedFrom: null,
    };
  });

  // Calculate new total cost after swaps
  let tempTotal = workingCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 2. Budget Trimming Step (Greedy Knapsack Selection)
  // If the total cost exceeds the budget, we sort items by their value score (rating / price) and greedily keep items that fit.
  if (tempTotal > budget) {
    // Sort items by value density (rating/price ratio) descending
    // We want to keep items that have high rating and low price.
    const itemsWithValueDensity = workingCart.map(item => {
      const prod = productMap.get(item.productId);
      const rating = prod ? prod.rating : 4.0;
      return {
        item,
        density: rating / item.price,
      };
    }).sort((a, b) => b.density - a.density);

    let currentBudgetUsed = 0;
    strategy += `Budget constraint met by prioritizing items with the highest value-to-cost ratio. `;

    for (const entry of itemsWithValueDensity) {
      const item = entry.item;
      const itemCost = item.price * item.quantity;

      if (currentBudgetUsed + itemCost <= budget) {
        // Fits entirely
        optimizedItems.push(item);
        currentBudgetUsed += itemCost;
      } else {
        // Doesn't fit in current quantity. Can we fit a smaller quantity?
        const maxFitQuantity = Math.floor((budget - currentBudgetUsed) / item.price);
        if (maxFitQuantity > 0) {
          optimizedItems.push({
            ...item,
            quantity: maxFitQuantity,
            reason: `${item.reason} (Reduced quantity from ${item.quantity} to ${maxFitQuantity} to fit budget).`,
          });
          currentBudgetUsed += item.price * maxFitQuantity;

          // Add the remainder to removed
          const removedQty = item.quantity - maxFitQuantity;
          removedItems.push({
            productId: item.productId,
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            imageHint: item.imageHint,
            quantity: removedQty,
            reason: `Reduced quantity to stay within budget.`,
          });
        } else {
          // Must remove completely
          removedItems.push({
            productId: item.productId,
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            imageHint: item.imageHint,
            quantity: item.quantity,
            reason: `Removed because its cost (₹${itemCost.toLocaleString('en-IN')}) would exceed your budget of ₹${budget.toLocaleString('en-IN')}.`,
          });

          if (item.swappedFrom) {
            // If it was a swap, make sure to list the original product as removed as well
            removedItems.push({
              ...item.swappedFrom,
              reason: `Swapped out and removed to meet budget limitations.`,
            });
          }
        }
      }
    }
  } else {
    // Fits budget easily! We can keep all items.
    workingCart.forEach(item => {
      optimizedItems.push(item);
      if (item.swappedFrom) {
        removedItems.push({
          ...item.swappedFrom,
          reason: `Swapped for a more optimal alternative.`,
        });
      }
    });
    strategy += `All items fit within your budget of ₹${budget.toLocaleString('en-IN')}. Swaps were applied to optimize overall savings and rating density.`;
  }

  // If there are no swaps and no removals, provide a default reasoning
  if (!strategy) {
    strategy = `Your cart is already fully optimized and matches your budget constraints perfectly!`;
  }

  return {
    optimizedCart: JSON.stringify(optimizedItems),
    removedItems: JSON.stringify(removedItems),
    reasoning: strategy,
  };
}
