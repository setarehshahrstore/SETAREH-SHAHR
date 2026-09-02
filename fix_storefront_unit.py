import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the text "حداقل: {product.minWholesaleQty}"
# with "حداقل: {product.minWholesaleQty} {product.minWholesaleUnit || ''}"

code = re.sub(
    r'Ø­Ø¯Ø§Ù‚Ù„: \{product\.minWholesaleQty\}',
    r'حداقل: {product.minWholesaleQty} {product.minWholesaleUnit || \'\'}',
    code
)
# And just in case it didn't have mangled characters:
code = re.sub(
    r'حداقل: \{product\.minWholesaleQty\}',
    r'حداقل: {product.minWholesaleQty} {product.minWholesaleUnit || \'\'}',
    code
)

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Storefront minWholesaleUnit updated")
