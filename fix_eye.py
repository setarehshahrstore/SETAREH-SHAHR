import re

for filename in ['src/components/Login.tsx', 'src/components/Register.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # Ensure Eye and EyeOff are imported
    if "Eye," not in code and "EyeOff" not in code:
        code = code.replace("import { ShieldCheck, Lock, Mail, AlertCircle, Building2 } from 'lucide-react';", "import { ShieldCheck, Lock, Mail, AlertCircle, Building2, Eye, EyeOff } from 'lucide-react';")
        code = code.replace("import { Mail, Lock, AlertCircle, User as UserIcon } from 'lucide-react';", "import { Mail, Lock, AlertCircle, User as UserIcon, Eye, EyeOff } from 'lucide-react';")

    if "const [showPassword, setShowPassword] = useState(false);" not in code:
        code = code.replace("const [password, setPassword] = useState('');", "const [password, setPassword] = useState('');\n  const [showPassword, setShowPassword] = useState(false);")
        
        # In Login.tsx, there's only one password input
        # In Register.tsx, there's also confirmPassword. Let's do both.
        if "setConfirmPassword" in code:
            code = code.replace("const [confirmPassword, setConfirmPassword] = useState('');", "const [confirmPassword, setConfirmPassword] = useState('');\n  const [showConfirmPassword, setShowConfirmPassword] = useState(false);")

    # Replace the password input type and add the button
    code = code.replace(
        '<input\n                    type="password"\n                    value={password}',
        '<input\n                    type={showPassword ? "text" : "password"}\n                    value={password}'
    )
    
    code = code.replace(
        '<input type="password" value={password}',
        '<input type={showPassword ? "text" : "password"} value={password}'
    )
    
    # Add the toggle button for password
    toggle_btn = """<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>"""
                  
    code = re.sub(r'(value=\{password\}.*?dir="ltr"\s*/>)', r'\1\n                  ' + toggle_btn, code, flags=re.DOTALL)
    
    # Same for confirm password in Register
    if "setConfirmPassword" in code:
        code = code.replace(
            '<input type="password" value={confirmPassword}',
            '<input type={showConfirmPassword ? "text" : "password"} value={confirmPassword}'
        )
        
        toggle_btn2 = """<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>"""
                  
        code = re.sub(r'(value=\{confirmPassword\}.*?dir="ltr"\s*/>)', r'\1\n                  ' + toggle_btn2, code, flags=re.DOTALL)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(code)

print("Eye icons added")
