import re
with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Line 386: {repr(lines[386].encode('utf-8'))}")

# I will just replace line 386
lines[386] = "        alert(حداقل خرید عمده برای این کالا   است.);\n"

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
