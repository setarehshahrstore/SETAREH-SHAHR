import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'Owner' | 'Manager' | 'Cashier' | 'Warehouse Staff' | 'Customer';

export interface User {
  id: string;
  username: string; // email
  fullName: string;
  role: UserRole;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Fetch role from Firestore
        try {
          const roleDoc = await getDoc(doc(db, 'userRoles', fbUser.uid));
          let role: UserRole = 'Customer'; // default
          let fullName = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'User');

          if (roleDoc.exists()) {
            role = roleDoc.data().role as UserRole;
            if (roleDoc.data().fullName) {
              fullName = roleDoc.data().fullName;
            }
          } else {
            // Auto-create customer role if not exists
            await setDoc(doc(db, 'userRoles', fbUser.uid), {
              role: 'Customer',
              fullName,
              email: fbUser.email
            });
          }

          setUser({
            id: fbUser.uid,
            username: fbUser.email || '',
            fullName,
            role,
            emailVerified: fbUser.emailVerified
          });
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Fallback
          setUser({
            id: fbUser.uid,
            username: fbUser.email || '',
            fullName: fbUser.displayName || 'User',
            role: 'Customer',
            emailVerified: fbUser.emailVerified
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
