import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add wholesale package details
pkg_info = """
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-amber-900 block">نرخ عمده (کارتن/بسته)</span>
                  {product.minWholesaleQty && product.minWholesaleQty > 1 && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded">
                      حداقل: {product.minWholesaleQty}
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-amber-700/80 mb-0.5 mt-0.5">
                  {product.units?.carton ? کارتن:   : 
                   product.units?.box ? بسته:   : 
                   product.units?.dozen ? جین:   : ''}
                </div>
"""

# I need to match the original DOM for Wholesale section using regex
# First, let's find the Wholesale Buy Section
code = re.sub(
    r'<div className="flex items-center gap-1">\s*<span className="text-\[10px\] font-bold text-amber-900 block">.*?</span>\s*\{product\.minWholesaleQty.*?</span>\s*\)\}\s*</div>',
    pkg_info.strip(),
    code,
    flags=re.DOTALL
)

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Wholesale package info added")
