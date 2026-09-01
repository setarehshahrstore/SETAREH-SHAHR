import re

with open('src/components/CustomerAccount.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

delete_button = """
              </div>
            )}
            
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-red-100">
              <div>
                <h4 className="font-bold text-red-600 text-sm">حذف حساب کاربری</h4>
                <p className="text-xs text-red-400">با این کار تمام اطلاعات شما پاک خواهد شد.</p>
              </div>
              <button type="button" onClick={handleDeleteAccount} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold text-xs transition-colors">
                حذف اکانت
              </button>
            </div>
"""

code = code.replace("              </div>\n            )\}\n          </div>", delete_button + "\n          </div>")

with open('src/components/CustomerAccount.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Delete button injected")
