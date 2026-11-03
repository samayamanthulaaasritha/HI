import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
  getAuth
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc,
  collection,
  query,
  where
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { auth, db, getTimestamp } from './firebase';
import app from './firebase';
import { UserProfile, UserRole } from '../types';

export const MASTER_ADMIN_EMAIL = 'hotelinfoadmin@gmail.com';
export const MASTER_ADMIN_PASSWORD = 'hotelinfoadmin@gmail.com';

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const isMasterAdmin = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();

  // If master admin login attempt, strictly verify matching password
  if (isMasterAdmin) {
    if (pass !== MASTER_ADMIN_PASSWORD) {
      throw new Error('Invalid master admin password.');
    }
  }

  let fbUser: FirebaseUser | null = null;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    fbUser = userCredential.user;
  } catch (err: any) {
    // If master admin account has not been provisioned in Firebase Auth yet, auto-provision
    if (isMasterAdmin) {
      try {
        const newCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        fbUser = newCredential.user;
        await updateProfile(fbUser, { displayName: 'Master Administrator' });
      } catch (createErr) {
        console.warn('Firebase createUser fallback for master admin:', createErr);
        const localAdminProfile: UserProfile = {
          uid: 'master_admin_hotelinfo',
          name: 'Master Administrator',
          email: MASTER_ADMIN_EMAIL,
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        localStorage.setItem('hotelinfo_admin_session', JSON.stringify(localAdminProfile));
        return localAdminProfile;
      }
    } else {
      // For Business Admin login: check Firestore / local credentials mirror created in Admin page
      try {
        const qUsers = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const userSnap = await getDocs(qUsers);
        const match = userSnap.docs.find((d) => {
          const u = d.data() as UserProfile;
          return u.role === 'business_admin' && (!u.tempPassword || u.tempPassword === pass);
        });

        if (match) {
          const profile = { uid: match.id, ...match.data() } as UserProfile;
          localStorage.setItem('hotelinfo_business_session', JSON.stringify(profile));
          return profile;
        }

        // Check local mirror of issued credentials
        const stored = JSON.parse(localStorage.getItem('hotelinfo_issued_credentials') || '[]');
        const localMatch = stored.find((c: any) => c.email.toLowerCase() === cleanEmail && c.pass === pass);
        if (localMatch) {
          const profile: UserProfile = {
            uid: localMatch.uid || `biz_${Date.now()}`,
            name: localMatch.name,
            email: localMatch.email,
            role: 'business_admin',
            businessId: localMatch.businessId,
            tempPassword: localMatch.pass,
            isActive: true,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('hotelinfo_business_session', JSON.stringify(profile));
          return profile;
        }
      } catch (bizLookupErr) {
        console.warn('Business credentials lookup error:', bizLookupErr);
      }

      throw err;
    }
  }

  if (isMasterAdmin) {
    const masterAdminProfile: UserProfile = {
      uid: fbUser ? fbUser.uid : 'master_admin_hotelinfo',
      name: 'Master Administrator',
      email: MASTER_ADMIN_EMAIL,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    if (fbUser) {
      try {
        await setDoc(doc(db, 'users', fbUser.uid), masterAdminProfile, { merge: true });
      } catch (docErr) {
        console.warn('Could not persist master admin in Firestore:', docErr);
      }
    }

    localStorage.setItem('hotelinfo_admin_session', JSON.stringify(masterAdminProfile));
    return masterAdminProfile;
  }

  // Regular user / business admin handling
  if (fbUser) {
    const profile = await getUserProfile(fbUser.uid);
    if (profile) {
      // Prevent non-master emails from possessing admin role
      if (profile.role === 'admin') {
        profile.role = 'user';
      }
      if (profile.role === 'business_admin') {
        localStorage.setItem('hotelinfo_business_session', JSON.stringify(profile));
      }
      try {
        await updateDoc(doc(db, 'users', fbUser.uid), {
          lastLoginAt: getTimestamp()
        });
      } catch {
        // Ignore background timestamp update error
      }
      return profile;
    }

    // Fallback if profile doc does not exist yet
    const fallbackProfile: UserProfile = {
      uid: fbUser.uid,
      name: fbUser.displayName || email.split('@')[0],
      email: fbUser.email || email,
      role: 'user',
      isActive: true,
      createdAt: getTimestamp()
    };
    try {
      await setDoc(doc(db, 'users', fbUser.uid), fallbackProfile, { merge: true });
    } catch {
      // Ignore
    }
    return fallbackProfile;
  }

  throw new Error('Authentication failed.');
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('hotelinfo_admin_session');
  localStorage.removeItem('hotelinfo_business_session');
  try {
    await signOut(auth);
  } catch {
    // Ignore signout error if session was local
  }
}

export async function sendResetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Failed to fetch user profile from Firestore:', err);
  }
  return null;
}

export async function createBusinessAdminAccount(
  email: string, 
  pass: string, 
  name: string, 
  businessId: string
): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  let uid = `biz_${Date.now()}`;

  // Use secondary Firebase Auth so current logged-in Master Admin is NOT signed out!
  try {
    const secondaryApp = getApps().find((a) => a.name === 'SecondaryAuth') || initializeApp(app.options, 'SecondaryAuth');
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, pass);
    if (userCredential.user) {
      uid = userCredential.user.uid;
      await updateProfile(userCredential.user, { displayName: name });
    }
    await signOut(secondaryAuth);
  } catch (authErr) {
    console.warn('Firebase secondary auth creation note:', authErr);
  }

  const profile: UserProfile = {
    uid,
    name,
    email: cleanEmail,
    role: 'business_admin',
    businessId,
    tempPassword: pass,
    isActive: true,
    createdAt: (typeof getTimestamp === 'function' ? getTimestamp() : null) || new Date().toISOString(),
    lastLoginAt: (typeof getTimestamp === 'function' ? getTimestamp() : null) || new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'users', uid), profile);
  } catch (err) {
    console.warn('Failed writing business admin to Firestore:', err);
  }

  // Also maintain local mirror of business credentials so BusinessLoginPage can read them immediately
  try {
    const existing = JSON.parse(localStorage.getItem('hotelinfo_issued_credentials') || '[]');
    const filtered = existing.filter((c: any) => c.email.toLowerCase() !== cleanEmail);
    filtered.push({ email: cleanEmail, pass, name, businessId, uid });
    localStorage.setItem('hotelinfo_issued_credentials', JSON.stringify(filtered));
  } catch {
    // ignore
  }

  return uid;
}

export async function getIssuedBusinessCredentials(): Promise<Array<{ email: string; pass: string; name: string; businessId: string; uid?: string }>> {
  const results: Array<{ email: string; pass: string; name: string; businessId: string; uid?: string }> = [];

  // 1. From Firestore users collection
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'business_admin'));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const data = d.data() as UserProfile;
      results.push({
        email: data.email,
        pass: data.tempPassword || 'hotel123',
        name: data.name,
        businessId: data.businessId || '',
        uid: data.uid
      });
    });
  } catch {
    // ignore
  }

  // 2. From localStorage mirror
  try {
    const local = JSON.parse(localStorage.getItem('hotelinfo_issued_credentials') || '[]');
    local.forEach((l: any) => {
      if (!results.some((r) => r.email.toLowerCase() === l.email.toLowerCase())) {
        results.push(l);
      }
    });
  } catch {
    // ignore
  }

  return results;
}

export async function createSystemUser(
  email: string,
  pass: string,
  name: string,
  role: UserRole,
  businessId?: string
): Promise<string> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = userCredential.user;
  await updateProfile(user, { displayName: name });

  const profile: UserProfile = {
    uid: user.uid,
    name,
    email: email.trim(),
    role,
    businessId: businessId || undefined,
    isActive: true,
    createdAt: getTimestamp(),
    lastLoginAt: getTimestamp()
  };

  await setDoc(doc(db, 'users', user.uid), profile);
  return user.uid;
}

export async function updateBusinessAdminPassword(
  uid: string,
  email: string,
  newPass: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Update Firestore user document
  try {
    await updateDoc(doc(db, 'users', uid), {
      tempPassword: newPass,
      updatedAt: getTimestamp()
    });
  } catch (err) {
    console.warn('Failed updating tempPassword in Firestore:', err);
  }

  // 2. Update localStorage credentials mirror
  try {
    const existing = JSON.parse(localStorage.getItem('hotelinfo_issued_credentials') || '[]');
    const index = existing.findIndex((c: any) => c.email.toLowerCase() === cleanEmail || c.uid === uid);
    if (index >= 0) {
      existing[index].pass = newPass;
    } else {
      existing.push({ email: cleanEmail, pass: newPass, uid });
    }
    localStorage.setItem('hotelinfo_issued_credentials', JSON.stringify(existing));
  } catch {
    // ignore
  }
}

