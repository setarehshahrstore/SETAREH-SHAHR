import re

with open('src/components/CustomerAccount.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add name and lastName to profileForm state
code = code.replace("phone: '', address: '', city: '', password: ''", "firstName: '', lastName: '', phone: '', address: '', city: '', password: ''")

# Add name to handleEditProfile
code = code.replace("phone: customer.phone || '',", "firstName: customer.name || '', lastName: customer.lastName || '', phone: customer.phone || '',")

# Add name to handleSaveProfile
code = code.replace("phone: profileForm.phone,", "name: profileForm.firstName,\n          lastName: profileForm.lastName,\n          phone: profileForm.phone,")

# Add form inputs for Name and LastName
new_inputs = """
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">نام</label>
              <input type="text" required value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">تخلص (نام خانوادگی)</label>
              <input type="text" required value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">شماره تماس (الزامی)</label>
"""

code = code.replace("""<div>
            <label className="block text-sm font-bold text-slate-700 mb-2">شماره تماس</label>""", new_inputs)

# Make phone and address required
code = code.replace('value={profileForm.phone} onChange', 'required value={profileForm.phone} onChange')
code = code.replace('value={profileForm.address} onChange', 'required value={profileForm.address} onChange')
code = code.replace('value={profileForm.city} onChange', 'required value={profileForm.city} onChange')

with open('src/components/CustomerAccount.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("CustomerAccount profile form updated")
