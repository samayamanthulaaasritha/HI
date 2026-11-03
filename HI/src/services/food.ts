import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, getTimestamp } from './firebase';
import { FoodItem } from '../types';

const COLLECTION_NAME = 'foodItems';

export async function getFoodItems(businessId: string): Promise<FoodItem[]> {
  if (!businessId) return [];
  try {
    const q = query(collection(db, COLLECTION_NAME), where('businessId', '==', businessId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ foodId: d.id, ...d.data() } as FoodItem));
  } catch (err) {
    console.error('getFoodItems error:', err);
    return [];
  }
}

export function subscribeToFoodItems(
  businessId: string,
  callback: (items: FoodItem[]) => void
): Unsubscribe {
  if (!businessId) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(collection(db, COLLECTION_NAME), where('businessId', '==', businessId));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ foodId: d.id, ...d.data() } as FoodItem));
        callback(items);
      },
      (err) => {
        console.error('subscribeToFoodItems error:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.error('subscribeToFoodItems error:', err);
    callback([]);
    return () => {};
  }
}

export async function createFoodItem(data: Omit<FoodItem, 'foodId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const foodId = `food_${Date.now()}`;
  const newItem: FoodItem = {
    ...data,
    foodId,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp()
  };
  await setDoc(doc(db, COLLECTION_NAME, foodId), newItem);
  return foodId;
}

export async function updateFoodItem(foodId: string, data: Partial<FoodItem>): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, foodId), {
    ...data,
    updatedAt: getTimestamp()
  });
}

export async function toggleFoodAvailability(foodId: string, isAvailable: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, foodId), {
    isAvailable,
    updatedAt: getTimestamp()
  });
}

export async function deleteFoodItem(foodId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, foodId));
}
