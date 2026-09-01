import re

with open('src/components/Settings.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make sure imports are there
if "initializeApp" not in code:
    code = code.replace("import { useAppState, AppState } from '../AppContext';", "import { useAppState, AppState } from '../AppContext';\nimport { initializeApp } from 'firebase/app';\nimport { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';\nimport { doc, setDoc } from 'firebase/firestore';\nimport { db } from '../firebase';")

if "secondaryFirebaseConfig" not in code:
    code = code.replace("import { db } from '../firebase';", "import { db } from '../firebase';\n\nconst secondaryFirebaseConfig = {\n  apiKey: 'AIzaSyBKO9ntx4T8QjjeM0snNt95tG6HUqhcii8',\n  authDomain: 'setareh-shahr.firebaseapp.com',\n  projectId: 'setareh-shahr',\n  storageBucket: 'setareh-shahr.firebasestorage.app',\n  messagingSenderId: '917912423484',\n  appId: '1:917912423484:web:f95762bb0f2a515577c739',\n  measurementId: 'G-DXP3DVYPEH'\n};")

old_func_pattern = re.compile(r'const handleAddUserSubmit = \(e: React\.FormEvent\) => \{.*?setIsAddingUser\(false\);\n\s*?\};', re.DOTALL)

new_func = """const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uname = newUsername.trim().toLowerCase();
    const pass = newPassword.trim();
    const fname = newFullName.trim();

    if (!uname || !pass || !fname) {
      alert('لطفاً تمامی گزینه‌های فرم را تکمیل فرمایید.');
      return;
    }

    if (pass.length < 6) {
      alert('رمز عبور باید حداقل 6 کاراکتر باشد.');
      return;
    }

    try {
      const secondaryApp = initializeApp(secondaryFirebaseConfig, 'SecondaryApp' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, uname, pass);
      await updateProfile(userCred.user, { displayName: fname });
      
      await setDoc(doc(db, 'userRoles', userCred.user.uid), {
        role: newUserRole,
        fullName: fname,
        email: uname
      });

      await secondaryAuth.signOut();
      
      const newUser = {
        username: uname,
        passwordHash: '***',
        fullName: fname,
        role: newUserRole as any,
        employeeCode: STS,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        status: 'Active' as const,
        baseSalaryAFN: 0,
        payments: [],
        createdAt: new Date().toISOString()
      };
      updateUsers([newUser, ...usersList]);

      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      setIsAddingUser(false);
      alert('کارمند با موفقیت ثبت شد!');
    } catch (err: any) {
      console.error(err);
      alert('خطا در ثبت کارمند: ' + err.message);
    }
  };"""

code = old_func_pattern.sub(new_func, code)

with open('src/components/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Settings fixed")
