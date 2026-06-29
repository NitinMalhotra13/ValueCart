
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAlternativeProductSuggestions } from '@/lib/ai-client';
import { Loader2, Send, Sparkles, ShoppingCart, Trash2 } from 'lucide-react';
import { formatIndianCurrency } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { products } from '@/lib/mock-data';
import { Product } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
}

const initialMessage: Message = {
  role: 'assistant',
  content:
    "Hi! I'm your AI Bargain Buddy. Tell me what you're looking for, and I'll find a cheaper alternative from our store.",
};

export function AiBargainBuddy() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getAlternativeProductSuggestions({
        productDescription: inputValue,
        products: products,
      });

      let assistantMessage: Message;
      if (response.suggestions.length > 0) {
        assistantMessage = {
          role: 'assistant',
          content: (
            <div className="space-y-2">
              <p>I found some alternatives for you:</p>
              <ul className="space-y-2">
                {response.suggestions.map((suggestion, index) => (
                  <li key={index} className="rounded-lg border bg-background p-2">
                    <p className="font-bold">{suggestion.name}</p>
                    <p>{suggestion.description}</p>
                    <p className="font-semibold text-primary">{formatIndianCurrency(suggestion.price)}</p>
                    <p className="text-xs italic text-muted-foreground">{suggestion.reason}</p>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleAddToCart(suggestion)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ),
        };
      } else {
        assistantMessage = {
          role: 'assistant',
          content: "Sorry, I couldn't find any specific alternatives for that right now. Could you try describing another product?",
        };
      }
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Oops! Something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearChat = () => {
    setMessages([initialMessage]);
  };


  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Bargain Buddy
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClearChat} disabled={messages.length <= 1}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Clear Chat</span>
          </Button>
        </div>
        <CardDescription>Get personalized shopping advice</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 min-h-0">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-md rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            placeholder="Ask for deals..."
            className="pr-12"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
