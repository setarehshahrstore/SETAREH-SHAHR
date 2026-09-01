import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

if "import { useTranslation }" not in code:
    code = code.replace("import React from 'react';", "import React, { useEffect } from 'react';\nimport { useTranslation } from 'react-i18next';")

if "const { i18n } = useTranslation();" not in code:
    app_effect = """const { i18n } = useTranslation();
  
  useEffect(() => {
    document.documentElement.dir = ['fa', 'ps'].includes(i18n.language) ? 'rtl' : 'ltr';
  }, [i18n.language]);"""
    
    code = code.replace("const App: React.FC = () => {", "const App: React.FC = () => {\n  " + app_effect)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("App.tsx configured for dir")
