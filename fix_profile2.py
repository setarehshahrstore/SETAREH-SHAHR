import re

with open('src/components/CustomerAccount.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

new_fields = """<form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">نام</label>
                      <input type="text" required value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">نام خانوادگی</label>
                      <input type="text" required value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                    </div>
                  </div>"""

code = code.replace('<form onSubmit={handleSaveProfile} className="space-y-4">', new_fields)

with open('src/components/CustomerAccount.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Profile fields added")
