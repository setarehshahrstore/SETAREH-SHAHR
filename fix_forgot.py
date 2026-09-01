import re

with open('src/components/ForgotPassword.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("const navigate = useNavigate();", "")
code = code.replace("import { useNavigate, Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';")

with open('src/components/ForgotPassword.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Removed navigate from ForgotPassword")
