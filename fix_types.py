import re

with open('src/types.ts', 'r', encoding='utf-8') as f:
    code = f.read()

if "minWholesaleUnit?: string" not in code:
    code = code.replace("minWholesaleQty?: number;", "minWholesaleQty?: number;\n  minWholesaleUnit?: string;")

with open('src/types.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("types.ts updated")
