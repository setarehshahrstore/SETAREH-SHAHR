import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix addToCart
old_add = """const addToCart = (product: Product, type: 'Retail' | 'Wholesale') => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.type === type);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      const initialQty = type === 'Wholesale' && product.minWholesaleQty ? product.minWholesaleQty : 1;
      return [...prev, { product, quantity: initialQty, type }];
    });
    // setIsCartOpen(true); // Removed so cart does not open automatically on add
  };"""

new_add = """const addToCart = (product: Product, type: 'Retail' | 'Wholesale') => {
    if (product.stockInBaseUnits <= 0) {
      alert('موجودی این کالا به اتمام رسیده است.');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.type === type);
      if (existing) {
        if (existing.quantity + 1 > product.stockInBaseUnits) {
          alert('موجودی انبار برای این کالا کافی نیست.');
          return prev;
        }
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      const initialQty = type === 'Wholesale' && product.minWholesaleQty ? product.minWholesaleQty : 1;
      
      if (initialQty > product.stockInBaseUnits) {
          alert('موجودی انبار برای این کالا کافی نیست.');
          return prev;
      }
      
      return [...prev, { product, quantity: initialQty, type }];
    });
  };"""

code = code.replace(old_add, new_add)

# Fix updateCartQty
old_update = """const updateCartQty = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = item.quantity + delta;
      const minQty = item.type === 'Wholesale' && item.product.minWholesaleQty ? item.product.minWholesaleQty : 1;
      
      if (item.type === 'Wholesale' && newQty < minQty && delta < 0) {
        alert(حداقل خرید عمده برای این کالا   است.);
        return prev;
      }

      if (newQty < 1) return prev;
      item.quantity = newQty;
      return updated;
    });
  };"""

new_update = """const updateCartQty = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = item.quantity + delta;
      const minQty = item.type === 'Wholesale' && item.product.minWholesaleQty ? item.product.minWholesaleQty : 1;
      
      if (item.type === 'Wholesale' && newQty < minQty && delta < 0) {
        alert(حداقل خرید عمده برای این کالا   است.);
        return prev;
      }

      if (newQty > item.product.stockInBaseUnits && delta > 0) {
        alert('موجودی انبار برای این کالا کافی نیست.');
        return prev;
      }

      if (newQty < 1) return prev;
      item.quantity = newQty;
      return updated;
    });
  };"""

code = code.replace(old_update, new_update)

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Storefront cart stock check added")
