import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace any alert without quotes that starts with alert(Ø
code = re.sub(r'alert\(Ø.*?Ø§Ø³Øª\.\);', r'alert(حداقل خرید عمده برای این کالا   است.);', code)

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Storefront syntax error fixed with regex")
