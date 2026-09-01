import re

with open('src/components/CustomerAccount.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

delete_account_fn = """
  const handleDeleteAccount = () => {
    if (window.confirm('آیا از حذف کامل حساب کاربری خود مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) {
      if (customer) {
        deleteCustomer(customer.id);
        logout();
        navigate('/');
      }
    }
  };
"""

if "handleDeleteAccount" not in code:
    code = code.replace("const handleLogout = () => {", delete_account_fn + "\n  const handleLogout = () => {")

delete_button = """
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

# Insert delete_button at the end of the profile tab, right after the handleSaveProfile form
code = code.replace("</form>\n              </div>\n            )}", f"</form>\n{delete_button}              </div>\n            )}}")

with open('src/components/CustomerAccount.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Delete account added")
