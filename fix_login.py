import re

for filename in ['src/components/Login.tsx', 'src/components/Register.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        code = f.read()
        
    code = code.replace(
        "role: 'Customer',",
        "role: userCred.user.email === 'setarehshahrstore@gmail.com' ? 'Owner' : 'Customer',"
    )
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(code)

print("Login and Register updated")
