import re

with open('src/components/Inventory.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update formData to include minWholesaleUnit
code = code.replace("minWholesaleQty: '', isDiscounted: false", "minWholesaleQty: '', minWholesaleUnit: 'کارتن', isDiscounted: false")

# 2. Update newProduct object to include minWholesaleUnit
code = code.replace("minWholesaleQty: parseInt(formData.minWholesaleQty) || undefined,", "minWholesaleQty: parseInt(formData.minWholesaleQty) || undefined,\n        minWholesaleUnit: formData.minWholesaleUnit,")

# 3. Update setFormData inside openEdit
code = code.replace("minWholesaleQty: p.minWholesaleQty ? p.minWholesaleQty.toString() : '',", "minWholesaleQty: p.minWholesaleQty ? p.minWholesaleQty.toString() : '',\n      minWholesaleUnit: p.minWholesaleUnit || 'کارتن',")

# 4. Extract unique units and render the datalist
# Find the start of the component to add the wholesaleUnitsList logic
# Let's add it near activeTab
unique_units_code = """
  const wholesaleUnitsList = Array.from(new Set(state.products.map(p => p.minWholesaleUnit).filter(Boolean)));
"""

if "const wholesaleUnitsList =" not in code:
    code = code.replace("const [activeTab, setActiveTab] = useState", unique_units_code + "  const [activeTab, setActiveTab] = useState")

# 5. Modify the minWholesaleQty input to include minWholesaleUnit input side-by-side
old_qty_input = """<div className="flex items-center gap-2 pt-2 border-t border-amber-100/50">
                        <span className="text-[10px] font-bold text-slate-500">حداقل خرید عمده:</span>
                        <input type="number" min="1" value={formData.minWholesaleQty} onChange={e => setFormData({...formData, minWholesaleQty: e.target.value})} className="w-full p-1 border border-amber-200 rounded text-xs bg-white font-mono text-left" dir="ltr" placeholder="اختیاری" />
                      </div>"""

new_qty_input = """<div className="flex items-center gap-2 pt-2 border-t border-amber-100/50">
                        <span className="text-[10px] font-bold text-slate-500">حداقل خرید عمده:</span>
                        <input type="number" min="1" value={formData.minWholesaleQty} onChange={e => setFormData({...formData, minWholesaleQty: e.target.value})} className="w-16 p-1 border border-amber-200 rounded text-xs bg-white font-mono text-center" dir="ltr" placeholder="تعداد" />
                        <input list="wholesale-units" type="text" value={formData.minWholesaleUnit} onChange={e => setFormData({...formData, minWholesaleUnit: e.target.value})} className="w-full p-1 border border-amber-200 rounded text-xs bg-white text-center" placeholder="واحد (مثلاً کارتن)" />
                        <datalist id="wholesale-units">
                          <option value="کارتن" />
                          <option value="بسته" />
                          <option value="جین" />
                          <option value="دانه" />
                          <option value="قوطی" />
                          {wholesaleUnitsList.map(u => <option key={u} value={u} />)}
                        </datalist>
                      </div>"""

# Wait, in the actual file, the persian characters might be mangled
# I will use replace with regex to be safe
code = re.sub(
    r'<div className="flex items-center gap-2 pt-2 border-t border-amber-100/50">\s*<span className="text-\[10px\].*?</span>\s*<input type="number".*?minWholesaleQty.*?</div>',
    new_qty_input,
    code,
    flags=re.DOTALL
)

with open('src/components/Inventory.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Inventory wholesale unit added")
