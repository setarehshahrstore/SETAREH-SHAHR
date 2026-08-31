import urllib.request
import base64

urls = {
    "chaching": "https://cdn.pixabay.com/download/audio/2021/08/04/audio_3d1a33a8c1.mp3?filename=cash-register-kaching-93513.mp3",
    "pop": "https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3?filename=pop-39222.mp3",
    "ring": "https://cdn.pixabay.com/download/audio/2021/08/04/audio_14bb1c85cd.mp3?filename=phone-ring-145610.mp3"
}

import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req_headers = {'User-Agent': 'Mozilla/5.0'}

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req, context=ctx) as response:
            data = response.read()
            b64 = base64.b64encode(data).decode('utf-8')
            print(f"{name}: data:audio/mp3;base64,{b64[:30]}...")
            with open(f"{name}.b64", "w") as f:
                f.write(f"data:audio/mp3;base64,{b64}")
    except Exception as e:
        print(f"Error {name}: {e}")
