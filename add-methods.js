
const fs = require('fs');
let content = fs.readFileSync('src/AppContext.tsx', 'utf8');

const interfaceTarget = '    deleteSales: (ids: string[]) => void;';
const interfaceAdd = '    editPurchase: (purchase: Purchase) => void;\n    deletePurchase: (id: string) => void;\n    deletePurchases: (ids: string[]) => void;';
content = content.replace(interfaceTarget, interfaceTarget + '\n' + interfaceAdd);

const valueTarget = '        deleteSales,';
const valueAdd = '        editPurchase,\n        deletePurchase,\n        deletePurchases,';
content = content.replace(valueTarget, valueTarget + '\n' + valueAdd);

const implTarget = '  const deleteSales = (saleIds: string[]) => {';
const implAdd =   const deletePurchases = (purchaseIds: string[]) => {
    setState((prev) => {
      let tempProducts = [...prev.products];
      let tempSuppliers = [...prev.suppliers];
      let tempCash = { ...prev.cashRegister };

      const purchasesToDelete = prev.purchases.filter(p => purchaseIds.includes(p.id));
      if (purchasesToDelete.length === 0) return prev;

      purchasesToDelete.forEach(purchaseToDelete => {
        tempProducts = tempProducts.map(p => {
          const purchItem = purchaseToDelete.items.find(item => item.productId === p.id);
          if (purchItem) {
            const baseUnitsToRemove = purchItem.quantity * purchItem.multiplier;
            return {
              ...p,
              stockInBaseUnits: Math.max(0, p.stockInBaseUnits - baseUnitsToRemove)
            };
          }
          return p;
        });

        tempSuppliers = tempSuppliers.map(s => {
          if (s.id === purchaseToDelete.supplierId) {
            const unpaidUSD = Math.max(0, purchaseToDelete.totalUSD - purchaseToDelete.paidUSD);
            const unpaidAFN = Math.max(0, purchaseToDelete.totalAFN - purchaseToDelete.paidAFN);
            return {
              ...s,
              debtUSD: Math.max(0, s.debtUSD - unpaidUSD),
              debtAFN: Math.max(0, s.debtAFN - unpaidAFN)
            };
          }
          return s;
        });

        tempCash.balanceUSD += purchaseToDelete.paidUSD;
        tempCash.balanceAFN += purchaseToDelete.paidAFN;
      });

      return {
        ...prev,
        products: tempProducts,
        suppliers: tempSuppliers,
        cashRegister: tempCash,
        purchases: prev.purchases.filter(p => !purchaseIds.includes(p.id))
      };
    });
  };

  const deletePurchase = (id: string) => deletePurchases([id]);

  const editPurchase = (purchase: Purchase) => {
    setState((prev) => {
      const oldPurchase = prev.purchases.find(p => p.id === purchase.id);
      if (!oldPurchase) return prev;
      
      let tempProducts = [...prev.products];
      let tempSuppliers = [...prev.suppliers];
      let tempCash = { ...prev.cashRegister };

      // Revert old
      tempProducts = tempProducts.map(p => {
        const purchItem = oldPurchase.items.find(item => item.productId === p.id);
        if (purchItem) {
          const baseUnitsToRemove = purchItem.quantity * purchItem.multiplier;
          return { ...p, stockInBaseUnits: Math.max(0, p.stockInBaseUnits - baseUnitsToRemove) };
        }
        return p;
      });
      tempSuppliers = tempSuppliers.map(s => {
        if (s.id === oldPurchase.supplierId) {
          const unpaidUSD = Math.max(0, oldPurchase.totalUSD - oldPurchase.paidUSD);
          const unpaidAFN = Math.max(0, oldPurchase.totalAFN - oldPurchase.paidAFN);
          return { ...s, debtUSD: Math.max(0, s.debtUSD - unpaidUSD), debtAFN: Math.max(0, s.debtAFN - unpaidAFN) };
        }
        return s;
      });
      tempCash.balanceUSD += oldPurchase.paidUSD;
      tempCash.balanceAFN += oldPurchase.paidAFN;

      // Apply new
      tempProducts = tempProducts.map(p => {
        const purchItem = purchase.items.find(item => item.productId === p.id);
        if (purchItem) {
          const baseUnitsToAdd = purchItem.quantity * purchItem.multiplier;
          return { ...p, stockInBaseUnits: p.stockInBaseUnits + baseUnitsToAdd };
        }
        return p;
      });
      tempSuppliers = tempSuppliers.map(s => {
        if (s.id === purchase.supplierId) {
          const unpaidUSD = Math.max(0, purchase.totalUSD - purchase.paidUSD);
          const unpaidAFN = Math.max(0, purchase.totalAFN - purchase.paidAFN);
          return { ...s, debtUSD: s.debtUSD + unpaidUSD, debtAFN: s.debtAFN + unpaidAFN };
        }
        return s;
      });
      tempCash.balanceUSD = Math.max(0, tempCash.balanceUSD - purchase.paidUSD);
      tempCash.balanceAFN = Math.max(0, tempCash.balanceAFN - purchase.paidAFN);

      return {
        ...prev,
        products: tempProducts,
        suppliers: tempSuppliers,
        cashRegister: tempCash,
        purchases: prev.purchases.map(p => p.id === purchase.id ? purchase : p)
      };
    });
  };

;
content = content.replace(implTarget, implAdd + '\n' + implTarget);

fs.writeFileSync('src/AppContext.tsx', content);
console.log('Modified AppContext.tsx successfully');
