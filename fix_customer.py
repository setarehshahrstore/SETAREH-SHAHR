import re

with open('src/components/CustomerAccount.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix imports to include useEffect
code = code.replace("import React, { useMemo, useState } from 'react';", "import React, { useMemo, useState, useEffect } from 'react';")

# Fix addCustomer extraction
code = code.replace("const { state, editCustomer } = useAppState();", "const { state, editCustomer, addCustomer } = useAppState();")

# Fix the useMemo for finding the customer
old_memo = """const customer = useMemo(() => {
    return state.customers.find(c => c.name === user?.fullName);
  }, [state.customers, user]);"""

new_memo = """const customer = useMemo(() => {
    return state.customers.find(c => c.username === user?.username || c.name === user?.fullName);
  }, [state.customers, user]);

  useEffect(() => {
    if (user && !customer && state.customers) {
      // Auto-create customer profile if it doesn't exist in state.customers
      const newCustomer = {
        id: user.id,
        name: user.fullName || 'کاربر جدید',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        type: 'retail' as const,
        debtAFN: 0,
        debtUSD: 0,
        username: user.username,
        passwordHash: '*** (Secured)'
      };
      // setTimeout to avoid updating state during render
      setTimeout(() => addCustomer(newCustomer), 0);
    }
  }, [user, customer, state.customers, addCustomer]);"""

code = code.replace(old_memo, new_memo)

with open('src/components/CustomerAccount.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("CustomerAccount fixed")
