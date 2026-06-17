import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Product, Customer, Supplier, Sale, Purchase, DebtPayment, CashRegister, CustomerInquiry, Category, ChatSession, ChatMessage, CartItem } from './types';
import { INITIAL_APP_STATE } from './mockData';
import { syncToFirebase, startFirebaseListeners } from './firebaseSync';

interface AppContextType {
  state: AppState;
  
  // Cart State
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;

  addSale: (sale: Sale) => void;
  addPurchase: (purchase: Purchase) => void;
  addPayment: (payment: DebtPayment) => void;
  deletePayment: (id: string) => void;
  editPayment: (payment: DebtPayment) => void;
  updateCustomerDebt: (id: string, amountAFN: number, amountUSD: number) => void;
  updateSupplierDebt: (id: string, amountAFN: number, amountUSD: number) => void;
  updateProductStock: (productId: string, changeBaseQty: number) => void;
  updateExchangeRate: (rate: number) => void;
  addProduct: (product: Product) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  editCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  editSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  updateDeliveryStatus: (saleId: string, status: string, driver?: string) => void;
  addInquiry: (inquiry: CustomerInquiry) => void;
  editInquiry: (inquiry: CustomerInquiry) => void;
  deleteInquiry: (id: string) => void;
  deleteInquiries: (ids: string[]) => void;
  editSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
  deleteSales: (ids: string[]) => void;
  editPurchase: (purchase: Purchase) => void;
  deletePurchase: (id: string) => void;
  deletePurchases: (ids: string[]) => void;
  deleteProducts: (ids: string[]) => void;
  deleteCustomers: (ids: string[]) => void;
  deleteSuppliers: (ids: string[]) => void;
  
  addCategory: (cat: Category) => void;
  editCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  addExpense: (expense: any) => void;
  deleteExpense: (id: string) => void;

  addTransaction: (transaction: any) => void;

  // Chat Methods
  addChatSession: (session: ChatSession) => void;
  addChatMessage: (sessionId: string, message: ChatMessage) => void;
  updateChatStatus: (sessionId: string, status: 'Active' | 'Waiting' | 'Closed') => void;
  markChatReadByAdmin: (sessionId: string) => void;
  markChatReadByCustomer: (sessionId: string) => void;
  deleteChatSession: (sessionId: string) => void;

  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'AFG_ERP_STATE';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reactState, setReactState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.inquiries) parsed.inquiries = [];
        if (!parsed.sales) parsed.sales = [];
        if (!parsed.products) parsed.products = [];
        if (!parsed.purchases) parsed.purchases = [];
        if (!parsed.payments) parsed.payments = [];
        if (!parsed.customers) parsed.customers = [];
        if (!parsed.suppliers) parsed.suppliers = [];
        if (!parsed.categories) parsed.categories = [];
        if (!parsed.expenses) parsed.expenses = [];
        if (!parsed.transactions) parsed.transactions = []; // Ensure generic transactions exist if needed
        if (!parsed.chatSessions) parsed.chatSessions = [];
        if (!parsed.exchangeRate) parsed.exchangeRate = 72.5;
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return INITIAL_APP_STATE;
  });

  const setState = (updater: AppState | ((prev: AppState) => AppState)) => {
    setReactState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        if (!(next as any)._fromFirebase) {
          syncToFirebase(prev, next);
        }
      } catch(e) { console.error("Firebase sync error", e); }
      
      const { _fromFirebase, ...cleanNext } = next as any;
      return cleanNext as AppState;
    });
  };

  const state = reactState;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reactState));
  }, [reactState]);

  useEffect(() => {
    return startFirebaseListeners(setState as any);
  }, []);

  const addCategory = (cat: Category) => setState(prev => ({ ...prev, categories: [...(prev.categories || []), cat] }));
  const editCategory = (cat: Category) => setState(prev => ({ ...prev, categories: (prev.categories || []).map(c => c.id === cat.id ? cat : c) }));
  const deleteCategory = (id: string) => setState(prev => ({ ...prev, categories: (prev.categories || []).filter(c => c.id !== id) }));

  const addExpense = (expense: any) => setState(prev => {
    const updatedCash = { ...prev.cashRegister };
    const amount = expense.amount || (expense.currency === 'AFN' ? expense.amountAFN : expense.amountUSD) || 0;
    if (expense.currency === 'AFN') updatedCash.balanceAFN -= amount;
    else updatedCash.balanceUSD -= amount;
    return { ...prev, cashRegister: updatedCash, expenses: [...(prev.expenses || []), expense] };
  });

  const deleteExpense = (id: string) => setState(prev => {
    const expense = (prev.expenses || []).find((e: any) => e.id === id);
    if (!expense) return prev;
    const updatedCash = { ...prev.cashRegister };
    const amount = expense.amount || (expense.currency === 'AFN' ? expense.amountAFN : expense.amountUSD) || 0;
    if (expense.currency === 'AFN') updatedCash.balanceAFN += amount;
    else updatedCash.balanceUSD += amount;
    return { ...prev, cashRegister: updatedCash, expenses: (prev.expenses || []).filter((e: any) => e.id !== id) };
  });

  const addTransaction = (transaction: any) => setState(prev => {
    const updatedCash = { ...prev.cashRegister };
    if (transaction.type === 'Income') {
      if (transaction.currency === 'AFN') updatedCash.balanceAFN += transaction.amount;
      else updatedCash.balanceUSD += transaction.amount;
    } else {
      if (transaction.currency === 'AFN') updatedCash.balanceAFN -= transaction.amount;
      else updatedCash.balanceUSD -= transaction.amount;
    }
    // Assume we have a transactions array in state if we want to store them, or just modify cashRegister
    return { ...prev, cashRegister: updatedCash };
  });

  const addChatSession = (session: ChatSession) => setState(prev => ({
    ...prev,
    chatSessions: [...(prev.chatSessions || []), session]
  }));

  const addChatMessage = (sessionId: string, message: ChatMessage) => setState(prev => {
    const sessions = prev.chatSessions || [];
    const updatedSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: [...s.messages, message],
          status: (message.sender === 'Customer' ? 'Waiting' : 'Active') as 'Active' | 'Waiting' | 'Closed',
          unreadByAdmin: message.sender === 'Customer' ? s.unreadByAdmin + 1 : s.unreadByAdmin,
          unreadByCustomer: message.sender !== 'Customer' ? s.unreadByCustomer + 1 : s.unreadByCustomer
        };
      }
      return s;
    });
    return { ...prev, chatSessions: updatedSessions };
  });

  const updateChatStatus = (sessionId: string, status: 'Active' | 'Waiting' | 'Closed') => setState(prev => ({
    ...prev,
    chatSessions: (prev.chatSessions || []).map(s => s.id === sessionId ? { ...s, status } : s)
  }));

  const markChatReadByAdmin = (sessionId: string) => setState(prev => ({
    ...prev,
    chatSessions: (prev.chatSessions || []).map(s => s.id === sessionId ? { ...s, unreadByAdmin: 0 } : s)
  }));

  const markChatReadByCustomer = (sessionId: string) => setState(prev => ({
    ...prev,
    chatSessions: (prev.chatSessions || []).map(s => s.id === sessionId ? { ...s, unreadByCustomer: 0 } : s)
  }));

  const addSale = (sale: Sale) => {
    setState((prev) => {
      // 1. Update product stock levels
      const updatedProducts = prev.products.map(p => {
        const saleItem = sale.items.find(item => item.productId === p.id);
        if (saleItem) {
          // Subtract quantities in base units (quantity * multiplier)
          const baseUnitsToSubtract = saleItem.quantity * saleItem.multiplier;
          return {
            ...p,
            stockInBaseUnits: Math.max(0, p.stockInBaseUnits - baseUnitsToSubtract)
          };
        }
        return p;
      });

      // 2. Adjust customer debt if credit/partial sale
      const updatedCustomers = prev.customers.map(c => {
        if (c.id === sale.customerId) {
          // Outstanding debt is the portion unpaid
          const unpaidUSD = Math.max(0, sale.finalUSD - sale.paidUSD);
          const unpaidAFN = Math.max(0, sale.finalAFN - sale.paidAFN);
          return {
            ...c,
            debtUSD: c.debtUSD + unpaidUSD,
            debtAFN: c.debtAFN + unpaidAFN
          };
        }
        return c;
      });

      // 3. Update Cash Register balances
      const updatedCash: CashRegister = {
        balanceUSD: prev.cashRegister.balanceUSD + sale.paidUSD,
        balanceAFN: prev.cashRegister.balanceAFN + sale.paidAFN
      };

      return {
        ...prev,
        products: updatedProducts,
        customers: updatedCustomers,
        sales: [sale, ...prev.sales],
        cashRegister: updatedCash
      };
    });
  };

  const addPurchase = (purchase: Purchase) => {
    setState((prev) => {
      // 1. Update product stock levels (increase stock)
      const updatedProducts = prev.products.map(p => {
        const purchItem = purchase.items.find(item => item.productId === p.id);
        if (purchItem) {
          const baseUnitsToAdd = purchItem.quantity * purchItem.multiplier;
          return {
            ...p,
            stockInBaseUnits: p.stockInBaseUnits + baseUnitsToAdd
          };
        }
        return p;
      });

      // 2. Adjust supplier debt if credit/partial purchase
      const updatedSuppliers = prev.suppliers.map(s => {
        if (s.id === purchase.supplierId) {
          const unpaidUSD = Math.max(0, purchase.totalUSD - purchase.paidUSD);
          const unpaidAFN = Math.max(0, purchase.totalAFN - purchase.paidAFN);
          return {
            ...s,
            debtUSD: s.debtUSD + unpaidUSD,
            debtAFN: s.debtAFN + unpaidAFN
          };
        }
        return s;
      });

      // 3. Update Cash Register (paying suppliers is an outflow)
      const updatedCash: CashRegister = {
        balanceUSD: Math.max(0, prev.cashRegister.balanceUSD - purchase.paidUSD),
        balanceAFN: Math.max(0, prev.cashRegister.balanceAFN - purchase.paidAFN)
      };

      return {
        ...prev,
        products: updatedProducts,
        suppliers: updatedSuppliers,
        purchases: [purchase, ...prev.purchases],
        cashRegister: updatedCash
      };
    });
  };

  const addPayment = (payment: DebtPayment) => {
    setState((prev) => {
      let updatedCustomers = prev.customers;
      let updatedSuppliers = prev.suppliers;
      let updatedCash = { ...prev.cashRegister };

      if (payment.partnerType === 'Customer') {
        // Reduct customer debt
        updatedCustomers = prev.customers.map(c => {
          if (c.id === payment.partnerId) {
            return {
              ...c,
              debtUSD: Math.max(0, c.debtUSD - payment.amountUSD),
              debtAFN: Math.max(0, c.debtAFN - payment.amountAFN)
            };
          }
          return c;
        });
        // Money in from customer debt recovery
        updatedCash.balanceUSD += payment.amountUSD;
        updatedCash.balanceAFN += payment.amountAFN;
      } else {
        // We pay our supplier back: reduces supplier debt
        updatedSuppliers = prev.suppliers.map(s => {
          if (s.id === payment.partnerId) {
            return {
              ...s,
              debtUSD: Math.max(0, s.debtUSD - payment.amountUSD),
              debtAFN: Math.max(0, s.debtAFN - payment.amountAFN)
            };
          }
          return s;
        });
        // Money out to supplier paydown
        updatedCash.balanceUSD = Math.max(0, updatedCash.balanceUSD - payment.amountUSD);
        updatedCash.balanceAFN = Math.max(0, updatedCash.balanceAFN - payment.amountAFN);
      }

      return {
        ...prev,
        customers: updatedCustomers,
        suppliers: updatedSuppliers,
        payments: [payment, ...prev.payments],
        cashRegister: updatedCash
      };
    });
  };

  const updateProductStock = (productId: string, changeBaseQty: number) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === productId
          ? { ...p, stockInBaseUnits: Math.max(0, p.stockInBaseUnits + changeBaseQty) }
          : p
      )
    }));
  };

  const updateExchangeRate = (rate: number) => {
    setState((prev) => ({
      ...prev,
      exchangeRate: rate
    }));
  };

  const addProduct = (product: Product) => {
    setState((prev) => ({
      ...prev,
      products: [...prev.products, product]
    }));
  };

  const editProduct = (product: Product) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? product : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const addCustomer = (customer: Customer) => {
    setState((prev) => ({
      ...prev,
      customers: [...prev.customers, customer]
    }));
  };

  const editCustomer = (customer: Customer) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map(c => c.id === customer.id ? customer : c)
    }));
  };

  const deleteCustomer = (id: string) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id)
    }));
  };

  const addSupplier = (supplier: Supplier) => {
    setState((prev) => ({
      ...prev,
      suppliers: [...prev.suppliers, supplier]
    }));
  };

  const editSupplier = (supplier: Supplier) => {
    setState((prev) => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === supplier.id ? supplier : s)
    }));
  };

  const deleteSupplier = (id: string) => {
    setState((prev) => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== id)
    }));
  };

  const updateDeliveryStatus = (saleId: string, status: string, driver?: string) => {
    setState((prev) => ({
      ...prev,
      sales: prev.sales.map(sale =>
        sale.id === saleId
          ? {
              ...sale,
              deliveryStatus: status as any,
              deliveryDriver: driver || sale.deliveryDriver,
              status: status === 'Delivered' ? 'Completed' : 'Pending Delivery'
            }
          : sale
      )
    }));
  };

  const addInquiry = (inquiry: CustomerInquiry) => {
    setState((prev) => ({
      ...prev,
      inquiries: [inquiry, ...(prev.inquiries || [])]
    }));
  };

  const editInquiry = (inquiry: CustomerInquiry) => {
    setState((prev) => ({
      ...prev,
      inquiries: (prev.inquiries || []).map(i => i.id === inquiry.id ? inquiry : i)
    }));
  };

  const deleteInquiry = (id: string) => {
    setState((prev) => ({
      ...prev,
      inquiries: (prev.inquiries || []).filter(i => i.id !== id)
    }));
  };

  const deleteInquiries = (ids: string[]) => {
    setState((prev) => ({
      ...prev,
      inquiries: (prev.inquiries || []).filter(i => !ids.includes(i.id))
    }));
  };

  const deleteProducts = (ids: string[]) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter(p => !ids.includes(p.id))
    }));
  };

  const deleteCustomers = (ids: string[]) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.filter(c => !ids.includes(c.id))
    }));
  };

  const deleteSuppliers = (ids: string[]) => {
    setState((prev) => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => !ids.includes(s.id))
    }));
  };

  const deleteSale = (saleId: string) => {
    setState((prev) => {
      const saleToDelete = prev.sales.find(s => s.id === saleId);
      if (!saleToDelete) return prev;

      // 1. Restore product stock levels
      const updatedProducts = prev.products.map(p => {
        const saleItem = saleToDelete.items.find(item => item.productId === p.id);
        if (saleItem) {
          const baseUnitsToRestore = saleItem.quantity * saleItem.multiplier;
          return {
            ...p,
            stockInBaseUnits: p.stockInBaseUnits + baseUnitsToRestore
          };
        }
        return p;
      });

      // 2. Adjust customer debt back
      const updatedCustomers = prev.customers.map(c => {
        if (c.id === saleToDelete.customerId) {
          const unpaidUSD = Math.max(0, saleToDelete.finalUSD - saleToDelete.paidUSD);
          const unpaidAFN = Math.max(0, saleToDelete.finalAFN - saleToDelete.paidAFN);
          return {
            ...c,
            debtUSD: Math.max(0, c.debtUSD - unpaidUSD),
            debtAFN: Math.max(0, c.debtAFN - unpaidAFN)
          };
        }
        return c;
      });

      // 3. Update Cash Register balances
      const updatedCash = {
        balanceUSD: Math.max(0, prev.cashRegister.balanceUSD - saleToDelete.paidUSD),
        balanceAFN: Math.max(0, prev.cashRegister.balanceAFN - saleToDelete.paidAFN)
      };

      return {
        ...prev,
        products: updatedProducts,
        customers: updatedCustomers,
        sales: prev.sales.filter(s => s.id !== saleId),
        cashRegister: updatedCash
      };
    });
  };

  const deleteSales = (saleIds: string[]) => {
    setState((prev) => {
      let tempProducts = [...prev.products];
      let tempCustomers = [...prev.customers];
      let tempCash = { ...prev.cashRegister };

      const salesToDelete = prev.sales.filter(s => saleIds.includes(s.id));
      if (salesToDelete.length === 0) return prev;

      salesToDelete.forEach(saleToDelete => {
        tempProducts = tempProducts.map(p => {
          const saleItem = saleToDelete.items.find(item => item.productId === p.id);
          if (saleItem) {
            const baseUnitsToRestore = saleItem.quantity * saleItem.multiplier;
            return {
              ...p,
              stockInBaseUnits: p.stockInBaseUnits + baseUnitsToRestore
            };
          }
          return p;
        });

        tempCustomers = tempCustomers.map(c => {
          if (c.id === saleToDelete.customerId) {
            const unpaidUSD = Math.max(0, saleToDelete.finalUSD - saleToDelete.paidUSD);
            const unpaidAFN = Math.max(0, saleToDelete.finalAFN - saleToDelete.paidAFN);
            return {
              ...c,
              debtUSD: Math.max(0, c.debtUSD - unpaidUSD),
              debtAFN: Math.max(0, c.debtAFN - unpaidAFN)
            };
          }
          return c;
        });

        tempCash.balanceUSD = Math.max(0, tempCash.balanceUSD - saleToDelete.paidUSD);
        tempCash.balanceAFN = Math.max(0, tempCash.balanceAFN - saleToDelete.paidAFN);
      });

      return {
        ...prev,
        products: tempProducts,
        customers: tempCustomers,
        sales: prev.sales.filter(s => !saleIds.includes(s.id)),
        cashRegister: tempCash
      };
    });
  };

  const deletePurchases = (purchaseIds: string[]) => {
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

  const deletePayment = (id: string) => {
    setState((prev) => {
      const payment = prev.payments.find(p => p.id === id);
      if (!payment) return prev;
      
      const newCustomers = [...prev.customers];
      const newSuppliers = [...prev.suppliers];
      const newCash = { ...prev.cashRegister };

      // Reverse cash
      newCash.balanceAFN -= payment.amountAFN;
      newCash.balanceUSD -= payment.amountUSD;

      // Reverse debt
      if (payment.partnerType === 'Customer') {
        const idx = newCustomers.findIndex(c => c.id === payment.partnerId);
        if (idx !== -1) {
          newCustomers[idx] = { 
            ...newCustomers[idx], 
            debtAFN: newCustomers[idx].debtAFN + payment.amountAFN,
            debtUSD: newCustomers[idx].debtUSD + payment.amountUSD
          };
        }
      } else {
        const idx = newSuppliers.findIndex(s => s.id === payment.partnerId);
        if (idx !== -1) {
          newSuppliers[idx] = { 
            ...newSuppliers[idx], 
            debtAFN: newSuppliers[idx].debtAFN + payment.amountAFN,
            debtUSD: newSuppliers[idx].debtUSD + payment.amountUSD
          };
        }
      }

      return {
        ...prev,
        payments: prev.payments.filter(p => p.id !== id),
        customers: newCustomers,
        suppliers: newSuppliers,
        cashRegister: newCash
      };
    });
  };

  const editPayment = (updatedPayment: DebtPayment) => {
    setState((prev) => {
      const oldPayment = prev.payments.find(p => p.id === updatedPayment.id);
      if (!oldPayment) return prev;
      
      const newCustomers = [...prev.customers];
      const newSuppliers = [...prev.suppliers];
      const newCash = { ...prev.cashRegister };

      // Reverse old cash, add new cash
      newCash.balanceAFN = newCash.balanceAFN - oldPayment.amountAFN + updatedPayment.amountAFN;
      newCash.balanceUSD = newCash.balanceUSD - oldPayment.amountUSD + updatedPayment.amountUSD;

      // Reverse old debt, apply new debt
      if (updatedPayment.partnerType === 'Customer') {
        const idx = newCustomers.findIndex(c => c.id === updatedPayment.partnerId);
        if (idx !== -1) {
          newCustomers[idx] = { 
            ...newCustomers[idx], 
            debtAFN: newCustomers[idx].debtAFN + oldPayment.amountAFN - updatedPayment.amountAFN,
            debtUSD: newCustomers[idx].debtUSD + oldPayment.amountUSD - updatedPayment.amountUSD
          };
        }
      } else {
        const idx = newSuppliers.findIndex(s => s.id === updatedPayment.partnerId);
        if (idx !== -1) {
          newSuppliers[idx] = { 
            ...newSuppliers[idx], 
            debtAFN: newSuppliers[idx].debtAFN + oldPayment.amountAFN - updatedPayment.amountAFN,
            debtUSD: newSuppliers[idx].debtUSD + oldPayment.amountUSD - updatedPayment.amountUSD
          };
        }
      }

      return {
        ...prev,
        payments: prev.payments.map(p => p.id === updatedPayment.id ? updatedPayment : p),
        customers: newCustomers,
        suppliers: newSuppliers,
        cashRegister: newCash
      };
    });
  };

  const updateCustomerDebt = (id: string, amountAFN: number, amountUSD: number) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === id ? { ...c, debtAFN: amountAFN, debtUSD: amountUSD } : c)
    }));
  };

  const updateSupplierDebt = (id: string, amountAFN: number, amountUSD: number) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === id ? { ...s, debtAFN: amountAFN, debtUSD: amountUSD } : s)
    }));
  };

  const deleteChatSession = (sessionId: string) => {
    setState(prev => ({
      ...prev,
      chatSessions: (prev.chatSessions || []).filter(s => s.id !== sessionId)
    }));
  };

  const editSale = (updatedSale: Sale) => {
    setState((prev) => {
      const oldSale = prev.sales.find(s => s.id === updatedSale.id);
      if (!oldSale) return prev;

      // 1. Revert old sale product stocks & apply updated sale product stocks
      let tempProducts = [...prev.products];
      tempProducts = tempProducts.map(p => {
        const oldItem = oldSale.items.find(item => item.productId === p.id);
        if (oldItem) {
          return {
            ...p,
            stockInBaseUnits: p.stockInBaseUnits + (oldItem.quantity * oldItem.multiplier)
          };
        }
        return p;
      });
      const updatedProducts = tempProducts.map(p => {
        const newItem = updatedSale.items.find(item => item.productId === p.id);
        if (newItem) {
          return {
            ...p,
            stockInBaseUnits: Math.max(0, p.stockInBaseUnits - (newItem.quantity * newItem.multiplier))
          };
        }
        return p;
      });

      // 2. Revert old customer debt & apply updated customer debt
      let tempCustomers = [...prev.customers];
      tempCustomers = tempCustomers.map(c => {
        if (c.id === oldSale.customerId) {
          const unpaidUSD = Math.max(0, oldSale.finalUSD - oldSale.paidUSD);
          const unpaidAFN = Math.max(0, oldSale.finalAFN - oldSale.paidAFN);
          return {
            ...c,
            debtUSD: Math.max(0, c.debtUSD - unpaidUSD),
            debtAFN: Math.max(0, c.debtAFN - unpaidAFN)
          };
        }
        return c;
      });
      const updatedCustomers = tempCustomers.map(c => {
        if (c.id === updatedSale.customerId) {
          const unpaidUSD = Math.max(0, updatedSale.finalUSD - updatedSale.paidUSD);
          const unpaidAFN = Math.max(0, updatedSale.finalAFN - updatedSale.paidAFN);
          return {
            ...c,
            debtUSD: c.debtUSD + unpaidUSD,
            debtAFN: c.debtAFN + unpaidAFN
          };
        }
        return c;
      });

      // 3. Revert old cash registry and apply updated cash
      const updatedCash = {
        balanceUSD: Math.max(0, prev.cashRegister.balanceUSD - oldSale.paidUSD + updatedSale.paidUSD),
        balanceAFN: Math.max(0, prev.cashRegister.balanceAFN - oldSale.paidAFN + updatedSale.paidAFN)
      };

      return {
        ...prev,
        products: updatedProducts,
        customers: updatedCustomers,
        sales: prev.sales.map(s => s.id === updatedSale.id ? updatedSale : s),
        cashRegister: updatedCash
      };
    });
  };

  const resetState = () => {
    setState(INITIAL_APP_STATE);
  };

  return (
    <AppContext.Provider value={{
      state,
      addSale,
      addPurchase,
      addPayment,
      deletePayment,
      editPayment,
      updateCustomerDebt,
      updateSupplierDebt,
      updateProductStock,
      updateExchangeRate,
      addProduct,
      editProduct,
      deleteProduct,
      addCustomer,
      editCustomer,
      deleteCustomer,
      addSupplier,
      editSupplier,
      deleteSupplier,
      updateDeliveryStatus,
      addInquiry,
      editInquiry,
      deleteInquiry,
      deleteInquiries,
      editSale,
      deleteSale,
      deleteSales,
      editPurchase,
      deletePurchase,
      deletePurchases,
      deleteProducts,
      deleteCustomers,
      deleteSuppliers,
      addCategory,
      editCategory,
      deleteCategory,
      addExpense,
      deleteExpense,
      addTransaction,
      addChatSession,
      addChatMessage,
      updateChatStatus,
      markChatReadByAdmin,
      markChatReadByCustomer,
      deleteChatSession,
      resetState,
      cart,
      setCart,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
