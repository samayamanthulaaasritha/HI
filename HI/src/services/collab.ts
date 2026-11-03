import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, getTimestamp } from './firebase';
import { CollabInquiry } from '../types';

const COLLECTION_NAME = 'collabInquiries';

export async function submitCollabInquiry(
  data: Omit<CollabInquiry, 'id' | 'status' | 'createdAt'>
): Promise<string> {
  const id = `collab_${Date.now()}`;
  const inquiry: CollabInquiry = {
    ...data,
    id,
    status: 'pending',
    createdAt: getTimestamp()
  };

  await setDoc(doc(db, COLLECTION_NAME, id), inquiry);
  return id;
}

export async function getCollabInquiries(): Promise<CollabInquiry[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CollabInquiry));
  } catch (err) {
    console.error('Failed to load collab inquiries:', err);
    return [];
  }
}

export function subscribeToCollabInquiries(
  callback: (inquiries: CollabInquiry[]) => void
): Unsubscribe {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CollabInquiry));
        callback(list);
      },
      (err) => {
        console.error('Collab listener error:', err);
        callback([]);
      }
    );
  } catch {
    callback([]);
    return () => {};
  }
}

export async function updateCollabStatus(
  id: string,
  status: CollabInquiry['status']
): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    status,
    updatedAt: getTimestamp()
  });
}
