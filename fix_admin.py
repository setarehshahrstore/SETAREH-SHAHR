import re

with open('src/AuthContext.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacement = """          if (roleDoc.exists()) {
            role = roleDoc.data().role as UserRole;
            if (roleDoc.data().fullName) {
              fullName = roleDoc.data().fullName;
            }
            // Auto-upgrade the main admin email
            if (fbUser.email === 'setarehshahrstore@gmail.com' && role !== 'Owner') {
              role = 'Owner';
              await setDoc(doc(db, 'userRoles', fbUser.uid), { role: 'Owner' }, { merge: true });
            }
          } else {
            // Auto-create role if not exists
            const initialRole = fbUser.email === 'setarehshahrstore@gmail.com' ? 'Owner' : 'Customer';
            role = initialRole;
            await setDoc(doc(db, 'userRoles', fbUser.uid), {
              role: initialRole,
              fullName,
              email: fbUser.email
            });
          }"""

pattern = re.compile(r'          if \(roleDoc\.exists\(\)\) \{.*?email: fbUser\.email\n            \}\);\n          \}', re.DOTALL)
code = pattern.sub(replacement, code)

with open('src/AuthContext.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("AuthContext updated")
