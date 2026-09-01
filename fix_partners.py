import re

with open('src/components/Partners.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

if "import { sendPasswordResetEmail }" not in code:
    code = code.replace("import { getAfgGeography } from '../geography';", "import { getAfgGeography } from '../geography';\nimport { sendPasswordResetEmail } from 'firebase/auth';\nimport { auth } from '../firebase';")

with open('src/components/Partners.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Partners fixed")
