import re

with open('src/components/CustomerAccount.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("const { state, editCustomer, addCustomer } = useAppState();", "const { state, editCustomer, addCustomer, deleteCustomer } = useAppState();")

with open('src/components/CustomerAccount.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("deleteCustomer imported")
