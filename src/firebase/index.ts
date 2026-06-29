import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Initialize Firebase App globally using config
export const firebaseApp: FirebaseApp = (() => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
})();

export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}

// Re-export core providers and hooks
export { FirebaseClientProvider } from "./client-provider";
export {
  FirebaseProvider,
  useFirebase,
  useAuth,
  useFirestore,
  useFirebaseApp,
  useMemoFirebase,
  useUser,
} from "./provider";

export { errorEmitter } from "./error-emitter";
export { FirestorePermissionError } from "./errors";
export { useUserProfile } from "./auth/use-user-profile";
export { useCollection } from "./firestore/use-collection";
export { useDoc } from "./firestore/use-doc";
