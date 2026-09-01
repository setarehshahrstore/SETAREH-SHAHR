import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("به فروشگاه ستاره شهر خوش آمدید", "{t('welcome')}")

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Storefront translation added")
