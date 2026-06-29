# **App Name**: ValueWise Cart

## Core Features:

- User Authentication: Secure user registration and login with email/password and Google OAuth, managed by Firebase Authentication.
- Collaborative Budget Management: Enable users to create and manage budgets collaboratively, invite other users, set category limits, and share a cart for collective shopping.
- Smart Cart Optimizer: Optimize the user's cart to maximize value within the budget constraints, utilizing a knapsack solver or greedy heuristic based on price, rating, discounts, and user preferences.
- AI Bargain Buddy: Provide real-time shopping suggestions and bargain simulation using heuristics. Bargain buddy will find cheaper alternatives, suggest bundles, and generate negotiation text, and the recommendations are available via a chat interface.
- Personalized Recommendations Engine: Offer product recommendations based on user behavior, preferences, and purchase history, incorporating content-based filtering and collaborative filtering.
- Price Drop Monitoring: Monitor prices of purchased products and notify users via email when a significant price drop occurs, utilizing Firebase Scheduler to automate price checks.
- Admin Panel: Provide an admin interface for managing products (CRUD operations), uploading images, viewing price history, and monitoring ML model status, with role-based access control using Firebase custom claims.

## Style Guidelines:

- Primary color: Teal (#008080), representing trust, efficiency, and savings.
- Background color: Light grayish-teal (#E0F8F8), offering a calm and uncluttered backdrop.
- Accent color: Mustard (#E4D00A) to highlight essential elements such as call-to-action buttons.
- Body and headline font: 'Inter', a sans-serif font to promote clear, contemporary feel
- Simple and intuitive icons for navigation and product categories.
- Clean, grid-based layout with clear separation of sections for easy navigation, emulating the Amazon-like structure. The layouts must perfectly reflect the designs from: https://v0-value-cart-smart-shopping.vercel.app/shop
- Subtle transitions and animations to enhance user interaction (e.g., cart updates).