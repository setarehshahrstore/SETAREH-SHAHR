
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
          setDoc(doc(db, col, item.id || Date.now().toString()), cleanItem).catch(e => console.error('Error writing to ' + col, e));
        }
      });
      
      // Deleted
      prevArray.forEach(oldItem => {
        if (!nextArray.find(item => item.id === oldItem.id)) {
          deleteDoc(doc(db, col, oldItem.id)).catch(e => console.error('Error deleting from ' + col, e));
        }
      });
    }
  });

  // Handle singletons
  if (prev.exchangeRate !== next.exchangeRate) {
    setDoc(doc(db, 'singletons', 'exchangeRate'), { value: next.exchangeRate });
  }
  if (prev.cashRegister !== next.cashRegister) {
    setDoc(doc(db, 'singletons', 'cashRegister'), next.cashRegister);
  }
};

export const startFirebaseListeners = (setState: React.Dispatch<React.SetStateAction<AppState>>) => {
  const unsubscribers: (() => void)[] = [];

  collections.forEach(col => {
    const unsub = onSnapshot(collection(db, col), (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      setState(prev => { 
        return { ...prev, [col]: data, _fromFirebase: true } as AppState; 
      });
    });
    unsubscribers.push(unsub);
  });

  const unsubExchange = onSnapshot(doc(db, 'singletons', 'exchangeRate'), (doc) => {
    if (doc.exists()) {
      setState(prev => ({ ...prev, exchangeRate: doc.data().value, _fromFirebase: true } as AppState));
    }
  });
  unsubscribers.push(unsubExchange);

  const unsubCash = onSnapshot(doc(db, 'singletons', 'cashRegister'), (doc) => {
    if (doc.exists()) {
      setState(prev => ({ ...prev, cashRegister: doc.data() as any, _fromFirebase: true } as AppState));
    }
  });
  unsubscribers.push(unsubCash);

  return () => {
    unsubscribers.forEach(u => u());
  };
};
