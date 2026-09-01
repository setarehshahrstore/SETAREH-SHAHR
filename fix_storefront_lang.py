import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

if "import { useTranslation } from 'react-i18next';" not in code:
    code = code.replace("import React, { useState, useMemo, useEffect } from 'react';", "import React, { useState, useMemo, useEffect } from 'react';\nimport { useTranslation } from 'react-i18next';")

# Inside Storefront, add useTranslation and language switcher
if "const { t, i18n } = useTranslation();" not in code:
    code = code.replace("const [cart, setCart] = useState", "const { t, i18n } = useTranslation();\n  const [cart, setCart] = useState")

    lang_switcher = """
              <div className="flex items-center gap-2">
                <select
                  value={i18n.language}
                  onChange={(e) => {
                    i18n.changeLanguage(e.target.value);
                    document.documentElement.dir = ['fa', 'ps'].includes(e.target.value) ? 'rtl' : 'ltr';
                  }}
                  className="bg-white/10 text-white text-xs border border-white/20 rounded-lg p-1.5 outline-none"
                >
                  <option value="fa">🇮🇷 فارسی</option>
                  <option value="ps">🇦🇫 پښتو</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>
"""
    # Insert it near the user actions in the header
    code = code.replace('<Link to="/login"', lang_switcher + '              <Link to="/login"')

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Language switcher added")
