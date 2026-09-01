
import { AppState } from './types';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const collections = [
  'products', 'sales', 'purchases', 'payments', 'customers', 
  'suppliers', 'categories', 'expenses', 'transactions', 
  'chatSessions', 'inquiries', 'users'
] as const;

export const syncToFirebase = (prev: AppState, next: AppState) => {
  collections.forEach(col => {
    if (prev[col] !== next[col]) {
      const prevArray = prev[col] as any[] || [];
      const nextArray = next[col] as any[] || [];
      
      // Added or modified
      nextArray.forEach(item => {
        const itemId = item.id || item.username;
        const oldItem = prevArray.find(old => (old.id || old.username) === itemId);
        if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
          // Remove undefined values to prevent Firebase "Unsupported field value: undefined" errors
          const cleanItem = JSON.parse(JSON.stringify(item));
          setDoc(doc(db, col, itemId || Date.now().toString()), cleanItem).catch(e => {
            // Local fallback active - log quietly
            console.debug(`Firestore sync notice for ${col}/${itemId}:`, e?.message || e);
          });
        }
      });
      
      // Deleted
      prevArray.forEach(oldItem => {
        const oldItemId = oldItem.id || oldItem.username;
        if (!nextArray.find(item => (item.id || item.username) === oldItemId)) {
          deleteDoc(doc(db, col, oldItemId)).catch(e => {
            console.debug(`Firestore sync notice for ${col}/${oldItemId}:`, e?.message || e);
          });
        }
      });
    }
  });

  // Handle singletons
  const singletons = ['exchangeRate', 'cashRegister', 'storeConfig', 'provinces', 'districts', 'storeHours', 'customCategories'] as const;
  
  singletons.forEach(singleton => {
    if (prev[singleton] !== next[singleton] && next[singleton] !== undefined) {
      setDoc(doc(db, 'singletons', singleton), { value: next[singleton] }).catch(e => {
        console.debug(`Firestore ${singleton} notice:`, e?.message || e);
      });
    }
  });
};

export const startFirebaseListeners = (setState: React.Dispatch<React.SetStateAction<AppState>>) => {
  const unsubscribers: (() => void)[] = [];

  collections.forEach(col => {
    try {
      const unsub = onSnapshot(
        collection(db, col),
        (snapshot) => {
          const data = snapshot.docs.map(d => d.data());
          if (data.length > 0) {
            setState(prev => { 
              return { ...prev, [col]: data, _fromFirebase: true } as AppState; 
            });
          }
        },
        (error) => {
          console.debug(`Firestore sync notification for '${col}':`, error.message);
        }
      );
      unsubscribers.push(unsub);
    } catch (e) {
      console.debug(`Could not attach listener for '${col}':`, e);
    }
  });

  try {
    const singletons = ['exchangeRate', 'cashRegister', 'storeConfig', 'provinces', 'districts', 'storeHours', 'customCategories'] as const;
    singletons.forEach(singleton => {
      const unsub = onSnapshot(
        doc(db, 'singletons', singleton),
        (doc) => {
          if (doc.exists()) {
            setState(prev => ({ ...prev, [singleton]: doc.data().value, _fromFirebase: true } as AppState));
          }
        },
        (error) => {
          console.debug(`Firestore sync notification for 'singletons/${singleton}':`, error.message);
        }
      );
      unsubscribers.push(unsub);
    });
  } catch (e) {
    console.debug("Could not attach listener for singletons:", e);
  }

  return () => {
    unsubscribers.forEach(u => {
      try {
        u();
      } catch (_) {}
    });
  };
};
