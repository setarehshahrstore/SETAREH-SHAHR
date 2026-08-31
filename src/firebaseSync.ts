
import { AppState } from './types';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const collections = [
  'products', 'sales', 'purchases', 'payments', 'customers', 
  'suppliers', 'categories', 'expenses', 'transactions', 
  'chatSessions', 'inquiries'
] as const;

export const syncToFirebase = (prev: AppState, next: AppState) => {
  collections.forEach(col => {
    if (prev[col] !== next[col]) {
      const prevArray = prev[col] as any[] || [];
      const nextArray = next[col] as any[] || [];
      
      // Added or modified
      nextArray.forEach(item => {
        const oldItem = prevArray.find(old => old.id === item.id);
        if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
          // Remove undefined values to prevent Firebase "Unsupported field value: undefined" errors
          const cleanItem = JSON.parse(JSON.stringify(item));
          setDoc(doc(db, col, item.id || Date.now().toString()), cleanItem).catch(e => {
            // Log as warning rather than breaking error if backend is temporarily offline
            console.warn(`Firestore sync write notice for ${col}/${item.id}:`, e?.message || e);
          });
        }
      });
      
      // Deleted
      prevArray.forEach(oldItem => {
        if (!nextArray.find(item => item.id === oldItem.id)) {
          deleteDoc(doc(db, col, oldItem.id)).catch(e => {
            console.warn(`Firestore sync delete notice for ${col}/${oldItem.id}:`, e?.message || e);
          });
        }
      });
    }
  });

  // Handle singletons
  if (prev.exchangeRate !== next.exchangeRate) {
    setDoc(doc(db, 'singletons', 'exchangeRate'), { value: next.exchangeRate }).catch(e => {
      console.warn('Firestore exchangeRate sync notice:', e?.message || e);
    });
  }
  if (prev.cashRegister !== next.cashRegister) {
    setDoc(doc(db, 'singletons', 'cashRegister'), next.cashRegister).catch(e => {
      console.warn('Firestore cashRegister sync notice:', e?.message || e);
    });
  }
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
          console.warn(`Firestore sync notification for '${col}':`, error.message);
        }
      );
      unsubscribers.push(unsub);
    } catch (e) {
      console.warn(`Could not attach listener for '${col}':`, e);
    }
  });

  try {
    const unsubExchange = onSnapshot(
      doc(db, 'singletons', 'exchangeRate'),
      (doc) => {
        if (doc.exists()) {
          setState(prev => ({ ...prev, exchangeRate: doc.data().value, _fromFirebase: true } as AppState));
        }
      },
      (error) => {
        console.warn("Firestore sync notification for 'singletons/exchangeRate':", error.message);
      }
    );
    unsubscribers.push(unsubExchange);
  } catch (e) {
    console.warn("Could not attach listener for 'singletons/exchangeRate':", e);
  }

  try {
    const unsubCash = onSnapshot(
      doc(db, 'singletons', 'cashRegister'),
      (doc) => {
        if (doc.exists()) {
          setState(prev => ({ ...prev, cashRegister: doc.data() as any, _fromFirebase: true } as AppState));
        }
      },
      (error) => {
        console.warn("Firestore sync notification for 'singletons/cashRegister':", error.message);
      }
    );
    unsubscribers.push(unsubCash);
  } catch (e) {
    console.warn("Could not attach listener for 'singletons/cashRegister':", e);
  }

  return () => {
    unsubscribers.forEach(u => {
      try {
        u();
      } catch (_) {}
    });
  };
};
