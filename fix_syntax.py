import re

with open('src/components/Storefront.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("alert(Ø­Ø¯Ø§Ù‚Ù„ Ø®Ø±ÛŒØ¯ Ø¹Ù…Ø¯Ù‡ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ú©Ø§Ù„Ø§   Ø§Ø³Øª.);", "alert(حداقل خرید عمده برای این کالا   است.);")

with open('src/components/Storefront.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Storefront syntax error fixed")
