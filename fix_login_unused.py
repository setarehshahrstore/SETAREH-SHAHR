import re

with open('src/components/Login.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("const location = useLocation();", "")
code = code.replace("import { useNavigate, useLocation, Link } from 'react-router-dom';", "import { useNavigate, Link } from 'react-router-dom';")

with open('src/components/Login.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Removed location from Login")
