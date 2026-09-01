import { useEffect } from 'react';
import { useAppState } from '../AppContext';

export const DynamicTitle = () => {
  const { state } = useAppState();
  
  useEffect(() => {
    const storeName = state.storeConfig?.storeName || 'فروشگاه ستاره شهر';
    document.title = storeName;
  }, [state.storeConfig?.storeName]);

  return null;
};
