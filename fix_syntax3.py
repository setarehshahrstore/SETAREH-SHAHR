import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    for line in lines:
        if 'alert(' in line and 'Ø' in line and 'return prev' not in line:
            f.write("        alert(حداقل خرید عمده برای این کالا   است.);\n")
        else:
            f.write(line)

print("Storefront syntax error fixed with lines loop")
