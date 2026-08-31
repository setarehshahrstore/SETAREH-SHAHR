// Utility to normalize barcode strings (converts Persian/Arabic digits, strips extensions)
export function normalizeBarcode(str: string): string {
  if (!str) return '';
  
  // Convert Persian/Arabic digits to English
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let normalized = String(str);
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replace(new RegExp(persianDigits[i], 'g'), String(i));
    normalized = normalized.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }

  // Strip common image extensions
  normalized = normalized.replace(/\.(png|jpe?g|webp|gif|bmp|jfif|svg)$/i, '');
  
  // Trim spaces and normalize
  return normalized.trim().toLowerCase();
}

// Compress and convert image file to optimized Base64 data URL
export function compressImageFile(
  file: File, 
  maxWidth = 600, 
  maxHeight = 600, 
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Fill with white background in case of PNG with transparency
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
