import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, getTimestamp } from './firebase';
import { UserProfile } from '../types';

const COLLECTION_NAME = 'users';

export async function getUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
  } catch (err) {
    console.error('Failed to load users from Firestore:', err);
    return [];
  }
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void): Unsubscribe {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        callback(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)));
      },
      (err) => {
        console.error('Users listener error:', err);
        callback([]);
      }
    );
  } catch {
    callback([]);
    return () => {};
  }
}

export async function toggleUserActive(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, uid), {
    isActive,
    updatedAt: getTimestamp()
  });
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, uid));
}
