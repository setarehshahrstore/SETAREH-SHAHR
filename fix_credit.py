import re

with open('src/components/CustomerAccount.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "debtUSD: 0,",
    "debtUSD: 0,\n        creditLimitUSD: 0,"
)

with open('src/components/CustomerAccount.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("CustomerAccount fixed creditLimitUSD")
