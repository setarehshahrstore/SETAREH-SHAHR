import re

with open('src/components/ExcelImportModal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# I will use a simple substring replacement to avoid regex dotall issues with the mangled persian chars
# First, insert the variable definitions right after cartonMultiplier
insertion = """            const minWholesaleQty = parseInt(row['حداقل فروش عمده (تعداد)'] || row['حداقل عمده'] || row['Min Wholesale Qty'] || 0) || undefined;
            const minWholesaleUnit = String(row['واحد فروش عمده'] || row['واحد عمده'] || row['Wholesale Unit'] || '').trim() || undefined;"""

# In the text, I see:
# const cartonMultiplier = parseInt(row['تعداد در کارتن (اختیاری)'] || row['تعداد در کارتن'] || row['Carton Qty'] || 0) || 0;
# Let's find "const cartonMultiplier =" and add the new vars after it
if "const minWholesaleQty" not in code:
    code = re.sub(
        r'(const cartonMultiplier =.*?\|\| 0;)',
        r'\1\n' + insertion,
        code
    )

# Now, add them to the product object.
# The product object has:
#               ...(cartonMultiplier > 0 ? { carton: { name: 'Ú©Ø§Ø±ØªÙ†', multiplier: cartonMultiplier } } : {})
#             },
#             status: 'draft',
if "minWholesaleQty," not in code:
    code = re.sub(
        r'(\.\.\.\(cartonMultiplier > 0 \? \{ carton: \{ name: \'.*?\', multiplier: cartonMultiplier \} \} : \{\}\)\s*\},)',
        r'\1\n              minWholesaleQty,\n              minWholesaleUnit,',
        code
    )

with open('src/components/ExcelImportModal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("ExcelImportModal updated for minWholesaleUnit")
