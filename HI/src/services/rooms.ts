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
import { Room, RoomAvailabilityStatus } from '../types';

const COLLECTION_NAME = 'rooms';

export async function getRooms(businessId: string): Promise<Room[]> {
  if (!businessId) return [];
  try {
    const q = query(collection(db, COLLECTION_NAME), where('businessId', '==', businessId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ roomId: d.id, ...d.data() } as Room));
  } catch (err) {
    console.error('getRooms error:', err);
    return [];
  }
}

export function subscribeToRooms(
  businessId: string,
  callback: (rooms: Room[]) => void
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
        const rooms = snap.docs.map((d) => ({ roomId: d.id, ...d.data() } as Room));
        callback(rooms);
      },
      (err) => {
        console.error('subscribeToRooms error:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.error('subscribeToRooms error:', err);
    callback([]);
    return () => {};
  }
}

export async function createRoom(data: Omit<Room, 'roomId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const roomId = `room_${Date.now()}`;
  const newRoom: Room = {
    ...data,
    roomId,
    availabilityStatus: data.availabilityStatus || (data.isAvailable ? 'Available' : 'Unavailable'),
    createdAt: getTimestamp(),
    updatedAt: getTimestamp()
  };
  await setDoc(doc(db, COLLECTION_NAME, roomId), newRoom);
  return roomId;
}

export async function updateRoom(roomId: string, data: Partial<Room>): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, roomId), {
    ...data,
    updatedAt: getTimestamp()
  });
}

export async function updateRoomAvailability(
  roomId: string,
  availabilityStatus: RoomAvailabilityStatus,
  availableRooms: number
): Promise<void> {
  const isAvailable = availabilityStatus === 'Available' || availabilityStatus === 'Limited';
  await updateDoc(doc(db, COLLECTION_NAME, roomId), {
    availabilityStatus,
    availableRooms: Math.max(0, availableRooms),
    isAvailable,
    updatedAt: getTimestamp()
  });
}

export async function deleteRoom(roomId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, roomId));
}
