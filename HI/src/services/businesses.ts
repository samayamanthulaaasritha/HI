import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, getTimestamp } from './firebase';
import { Business, SearchFilter } from '../types';

const COLLECTION_NAME = 'businesses';

function filterBusinesses(list: Business[], city?: string, typeFilter: SearchFilter = 'all'): Business[] {
  return list.filter((b) => {
    // Only exclude if explicitly set to false
    if (b.isActive === false) return false;

    if (city && city.trim()) {
      const q = city.trim().toLowerCase();
      const matchCity = b.city?.toLowerCase().includes(q);
      const matchAddress = b.address?.toLowerCase().includes(q);
      const matchName = b.businessName?.toLowerCase().includes(q);
      const matchState = b.state?.toLowerCase().includes(q);
      if (!matchCity && !matchAddress && !matchName && !matchState) return false;
    }

    if (typeFilter === 'food') {
      const hasFood = (b.totalFoodItems || 0) > 0 || b.businessType === 'restaurant' || b.businessType === 'hotel_restaurant';
      if (!hasFood) return false;
    } else if (typeFilter === 'rooms') {
      const hasRooms = (b.totalRooms || 0) > 0 || b.businessType === 'hotel' || b.businessType === 'hotel_restaurant' || b.businessType === 'lodge' || b.businessType === 'resort';
      if (!hasRooms) return false;
    } else if (typeFilter === 'both') {
      const hasBoth = ((b.totalRooms || 0) > 0 || b.businessType === 'hotel_restaurant') && ((b.totalFoodItems || 0) > 0 || b.businessType === 'hotel_restaurant');
      if (!hasBoth) return false;
    }

    return true;
  });
}

export async function getBusinesses(cityFilter?: string, typeFilter?: SearchFilter): Promise<Business[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snap = await getDocs(q);
    const items: Business[] = snap.docs.map((docSnap) => ({
      businessId: docSnap.id,
      ...docSnap.data()
    } as Business));
    return filterBusinesses(items, cityFilter, typeFilter);
  } catch (err) {
    console.error('Firestore getBusinesses error:', err);
    return [];
  }
}

export function subscribeToBusinesses(
  callback: (businesses: Business[]) => void,
  cityFilter?: string,
  typeFilter: SearchFilter = 'all'
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ businessId: d.id, ...d.data() } as Business));
        callback(filterBusinesses(items, cityFilter, typeFilter));
      },
      (err) => {
        console.error('subscribeToBusinesses error:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.error('subscribeToBusinesses error:', err);
    callback([]);
    return () => {};
  }
}

export function subscribeToBusiness(
  businessId: string,
  callback: (business: Business | null) => void
): Unsubscribe {
  if (!businessId) {
    callback(null);
    return () => {};
  }
  try {
    const docRef = doc(db, COLLECTION_NAME, businessId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ businessId: docSnap.id, ...docSnap.data() } as Business);
        } else {
          callback(null);
        }
      },
      (err) => {
        console.error('subscribeToBusiness error:', err);
        callback(null);
      }
    );
  } catch {
    callback(null);
    return () => {};
  }
}

export async function getBusinessById(businessId: string): Promise<Business | null> {
  if (!businessId) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, businessId));
    if (snap.exists()) {
      return { businessId: snap.id, ...snap.data() } as Business;
    }
  } catch (err) {
    console.error('getBusinessById error:', err);
  }
  return null;
}

export async function createBusiness(data: Partial<Business>): Promise<string> {
  const businessId = data.businessId || `biz_${Date.now()}`;
  const newBusiness: Business = {
    businessId,
    businessName: data.businessName || '',
    businessType: data.businessType || 'hotel',
    description: data.description || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    country: data.country || 'India',
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    coverImage: data.coverImage || '',
    gallery: data.gallery || [],
    videoUrl: data.videoUrl || null,
    audioUrl: data.audioUrl || null,
    rating: data.rating || 0,
    isActive: true,
    timings: data.timings || '',
    totalRooms: data.totalRooms || 0,
    availableRooms: data.availableRooms || 0,
    totalFoodItems: data.totalFoodItems || 0,
    availableFoodItems: data.availableFoodItems || 0,
    startingRoomPrice: data.startingRoomPrice || 0,
    startingFoodPrice: data.startingFoodPrice || 0,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp()
  };

  await setDoc(doc(db, COLLECTION_NAME, businessId), newBusiness);
  return businessId;
}

export async function updateBusiness(businessId: string, data: Partial<Business>): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, businessId), {
    ...data,
    updatedAt: getTimestamp()
  });
}

export async function toggleBusinessStatus(businessId: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, businessId), {
    isActive,
    updatedAt: getTimestamp()
  });
}

export async function softDeleteBusiness(businessId: string): Promise<void> {
  await toggleBusinessStatus(businessId, false);
}
