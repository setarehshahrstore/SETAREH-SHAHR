with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "alert(Ø" in line or (line.strip().startswith("alert(") and "Ø" in line):
        lines[i] = "        alert(حداقل خرید عمده برای این کالا   است.);\n"
        print(f"Replaced line {i}")

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
