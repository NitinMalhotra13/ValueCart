
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { setDocumentNonBlocking } from './non-blocking-updates';
import { doc, getFirestore } from 'firebase/firestore';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  return signInAnonymously(authInstance).then(() => {});
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, name: string): Promise<void> {
    return createUserWithEmailAndPassword(authInstance, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user) {
                // Send verification email first
                return sendEmailVerification(user).then(() => {
                    // Then create the user profile document
                    const db = getFirestore(authInstance.app);
                    const userRef = doc(db, 'users', user.uid);
                    // This is a non-blocking call.
                    setDocumentNonBlocking(userRef, {
                        id: user.uid,
                        email: user.email,
                        name: name,
                        isAdmin: false, // Default to not admin
                        emailVerified: user.emailVerified,
                    }, { merge: true });
                });
            }
            return Promise.resolve();
        });
}


/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  // This now returns the promise as it should.
  return signInWithEmailAndPassword(authInstance, email, password).then(() => {});
}

/** Initiate password reset email (non-blocking). */
export function initiatePasswordReset(authInstance: Auth, email: string): Promise<void> {
    return sendPasswordResetEmail(authInstance, email);
}
