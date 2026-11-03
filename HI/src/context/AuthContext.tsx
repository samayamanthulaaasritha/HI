import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { loginWithEmail, logoutUser, sendResetPassword, MASTER_ADMIN_EMAIL } from '../services/auth';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isBusinessAdmin: boolean;
  businessId: string | null;
  login: (email: string, pass: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('hotelinfo_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase()) {
          return parsed;
        }
      }
      const storedBiz = localStorage.getItem('hotelinfo_business_session');
      if (storedBiz) {
        const parsedBiz = JSON.parse(storedBiz);
        if (parsedBiz.role === 'business_admin') {
          return parsedBiz;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        const isMaster = fbUser.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase();
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            if (isMaster) {
              data.role = 'admin';
              localStorage.setItem('hotelinfo_admin_session', JSON.stringify(data));
            } else if (data.role === 'admin') {
              // Deny admin privileges to any unauthorized email
              data.role = 'user';
              localStorage.removeItem('hotelinfo_admin_session');
            } else if (data.role === 'business_admin') {
              localStorage.setItem('hotelinfo_business_session', JSON.stringify(data));
            }
            setUserProfile(data);
          } else {
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || (isMaster ? 'Master Administrator' : fbUser.email?.split('@')[0] || 'User'),
              email: fbUser.email || '',
              role: isMaster ? 'admin' : 'user',
              isActive: true,
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(doc(db, 'users', fbUser.uid), newProfile, { merge: true });
            } catch {
              // ignore
            }
            if (isMaster) {
              localStorage.setItem('hotelinfo_admin_session', JSON.stringify(newProfile));
            }
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user document:', err);
          if (isMaster) {
            const fallback: UserProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || 'Master Administrator',
              email: MASTER_ADMIN_EMAIL,
              role: 'admin',
              isActive: true,
              createdAt: new Date().toISOString()
            };
            setUserProfile(fallback);
            localStorage.setItem('hotelinfo_admin_session', JSON.stringify(fallback));
          } else {
            setUserProfile(null);
          }
        }
      } else {
        // No Firebase user; check if localStorage has saved admin or business session
        const storedAdmin = localStorage.getItem('hotelinfo_admin_session');
        const storedBiz = localStorage.getItem('hotelinfo_business_session');
        if (storedAdmin) {
          try {
            const parsed = JSON.parse(storedAdmin);
            if (parsed.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase()) {
              setUserProfile(parsed);
            } else {
              setUserProfile(null);
            }
          } catch {
            setUserProfile(null);
          }
        } else if (storedBiz) {
          try {
            const parsedBiz = JSON.parse(storedBiz);
            if (parsedBiz.role === 'business_admin') {
              setUserProfile(parsedBiz);
            } else {
              setUserProfile(null);
            }
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    const profile = await loginWithEmail(email, pass);
    setUserProfile(profile);
    return profile;
  };

  const logout = async () => {
    localStorage.removeItem('hotelinfo_admin_session');
    localStorage.removeItem('hotelinfo_business_session');
    setUserProfile(null);
    setCurrentUser(null);
    await logoutUser();
  };

  const resetPassword = async (email: string) => {
    await sendResetPassword(email);
  };

  const isAdmin = Boolean(
    userProfile?.role === 'admin' &&
    userProfile?.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase()
  );
  const isBusinessAdmin = userProfile?.role === 'business_admin';
  const businessId = userProfile?.businessId || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isBusinessAdmin,
        businessId,
        login,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
