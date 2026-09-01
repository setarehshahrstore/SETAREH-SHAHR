import re
with open('src/main.tsx', 'r', encoding='utf-8') as f:
    code = f.read()
if "import './i18n';" not in code:
    code = code.replace("import App from './App';", "import App from './App';\nimport './i18n';")
with open('src/main.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("i18n imported to main.tsx")
