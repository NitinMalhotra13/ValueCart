'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider'; // Adjusted import

export interface UseUserResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook to get the current authenticated user from Firebase.
 *
 * @returns {UseUserResult} - An object containing the user, loading state, and error.
 */
export function useUser(): UseUserResult {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    // If no auth instance is available, we can't determine the user.
    if (!auth) {
      setIsUserLoading(false);
      // Optional: setUserError(new Error("Firebase Auth service not available."));
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsUserLoading(false);
      },
      (error) => {
        console.error("useUser - onAuthStateChanged error:", error);
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Re-run effect if the auth instance changes

  return { user, isUserLoading, userError };
}
