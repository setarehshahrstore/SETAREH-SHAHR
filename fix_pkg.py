import json

with open('package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)

pkg['dependencies']['i18next'] = '^23.10.1'
pkg['dependencies']['react-i18next'] = '^14.1.0'
pkg['dependencies']['i18next-browser-languagedetector'] = '^7.2.0'

with open('package.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)

print("Dependencies added")
