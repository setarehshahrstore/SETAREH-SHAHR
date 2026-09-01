import re

for filename in ['src/components/Login.tsx', 'src/components/Register.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        code = f.read()

    # Move Lock to left-3, Eye to right-3
    code = code.replace('Lock className="absolute right-3 top-3', 'Lock className="absolute left-3 top-3')
    code = code.replace('left-3 top-3.5', 'right-3 top-3.5')
    
    # Also adjust input padding for password (needs pl-10 for lock on left, pr-10 for eye on right)
    # The inputs currently have pl-3 pr-10
    code = re.sub(r'(type=\{show.*?\}[\s\S]*?className="w-full)\s+pl-3\s+pr-10', r'\1 pl-10 pr-10', code)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(code)

print("Icons swapped")
