
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { collection, query, where, getDocs, type Firestore } from 'firebase/firestore';
import { UserProfile } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianCurrency(price: number) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  return formatter.format(price);
}

export async function getUsersByIds(firestore: Firestore, userIds: string[]): Promise<UserProfile[]> {
  if (!userIds || userIds.length === 0) {
    return [];
  }
  const usersRef = collection(firestore, 'users');
  // Firestore 'in' query is limited to 30 elements
  const chunks = [];
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30));
  }
  
  const userPromises = chunks.map(chunk => {
    const q = query(usersRef, where('id', 'in', chunk));
    return getDocs(q);
  });

  const querySnapshots = await Promise.all(userPromises);
  const users: UserProfile[] = [];
  querySnapshots.forEach(snapshot => {
    snapshot.forEach(doc => {
      users.push(doc.data() as UserProfile);
    });
  });

  return users;
}
