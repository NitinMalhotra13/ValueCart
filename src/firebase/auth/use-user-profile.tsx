'use client';

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { type UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';

interface UseUserProfileResult {
  userProfile: UserProfile | null;
  isUserProfileLoading: boolean;
}

/**
 * Hook to get the current authenticated user's profile from Firestore.
 */
export function useUserProfile(): UseUserProfileResult {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileDocLoading } = useDoc<UserProfile>(userProfileRef);

  return {
    userProfile: userProfile,
    isUserProfileLoading: isAuthLoading || isProfileDocLoading,
  };
}
