import re

with open('src/components/CustomerAccount.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make sure deleteUser is imported
if "deleteUser" not in code:
    if "from 'firebase/auth'" in code:
        code = code.replace("from 'firebase/auth';", ", deleteUser } from 'firebase/auth';").replace("{ ,", "{")
    else:
        code = code.replace("import { useAppState }", "import { getAuth, deleteUser } from 'firebase/auth';\nimport { auth } from '../firebase';\nimport { useAppState }")

# Update handleDeleteAccount
old_del = """
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

new_del = """
  const handleDeleteAccount = async () => {
    if (window.confirm('آیا از حذف کامل حساب کاربری خود مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) {
      if (customer) {
        try {
          if (auth.currentUser) {
            await deleteUser(auth.currentUser);
          }
          deleteCustomer(customer.id);
          logout();
          navigate('/');
        } catch (error: any) {
          if (error.code === 'auth/requires-recent-login') {
            alert('برای حذف اکانت به دلایل امنیتی، لطفا ابتدا یک بار خارج شده و دوباره وارد شوید.');
          } else {
            alert('خطا در حذف اکانت: ' + error.message);
          }
        }
      }
    }
  };
"""

code = code.replace(old_del.strip(), new_del.strip())

with open('src/components/CustomerAccount.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("handleDeleteAccount updated")
