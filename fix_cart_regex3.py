import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

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
      
      item.quantity = Math.max(1, newQty);
      return updated;
    });
  };"""

# I need to match the mangled persian text:
# alert(ØØ¯Ø§Ù‚Ù„ Ø®Ø±ÛŒØ¯ Ø¹Ù…Ø¯Ù‡ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ú©Ø§Ù„Ø§   \nØ§Ø³Øª.);

# Let's just use a super simple regex:
code = re.sub(
    r"const updateCartQty = \(index: number, delta: number\) => \{.*?return updated;\s*\}\);\s*\};",
    """const updateCartQty = (index: number, delta: number) => {
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
      
      item.quantity = Math.max(1, newQty);
      return updated;
    });
  };""",
    code,
    flags=re.DOTALL
)

code = re.sub(
    r"const addToCart = \(product: Product, type: 'Retail' \| 'Wholesale'\) => \{.*?// setIsCartOpen\(true\); // Removed so cart does not open automatically on add\s*\};",
    """const addToCart = (product: Product, type: 'Retail' | 'Wholesale') => {
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
  };""",
    code,
    flags=re.DOTALL
)

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Storefront cart stock check regex applied with DOTALL and Math.max")
