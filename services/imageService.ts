
import { WatermarkConfig, ImageFilter } from '../types';

export const applyWatermark = (base64Image: string, config: WatermarkConfig): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If watermark is disabled or no text, return original immediately
    if (!config.enabled || !config.text.trim()) {
      resolve(base64Image);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Ensure we have a valid data URL
    img.src = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure Text
      // Calculate font size based on image width to keep it responsive
      const baseSize = Math.max(20, img.width / 20); 
      const fontSize = baseSize * (config.size / 50); // size is 1-100 scale, 50 is nominal
      
      ctx.font = `bold ${fontSize}px ${config.font}`;
      ctx.globalAlpha = config.opacity / 100;
      ctx.fillStyle = config.color;
      ctx.textBaseline = 'middle';

      const textMetrics = ctx.measureText(config.text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize; // Approx height
      const padding = fontSize * 0.75;

      let x = 0;
      let y = 0;

      switch (config.position) {
        case 'top-left':
          x = padding;
          y = padding + textHeight / 2;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding;
          y = padding + textHeight / 2;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding - textHeight / 2;
          break;
        case 'bottom-right':
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding - textHeight / 2;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height / 2;
          break;
      }

      ctx.fillText(config.text, x, y);

      // Return generated image
      // Detect mime type from original if possible, default to png
      const mimeType = base64Image.match(/image\/(\w+)/)?.[1] || 'png';
      resolve(canvas.toDataURL(`image/${mimeType}`));
    };

    img.onerror = (err) => reject(err);
  });
};

export const applyImageFilter = (base64Image: string, filter: ImageFilter): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Ensure we have a valid data URL
    const src = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Apply Filter
      if (filter !== 'none') {
        switch (filter) {
          case 'grayscale':
            ctx.filter = 'grayscale(100%)';
            break;
          case 'sepia':
            ctx.filter = 'sepia(100%)';
            break;
          case 'vintage':
            ctx.filter = 'sepia(50%) contrast(85%) brightness(110%) saturate(80%)';
            break;
          case 'high-contrast':
            ctx.filter = 'contrast(150%) brightness(105%)';
            break;
        }
      }

      ctx.drawImage(img, 0, 0);

      // Get MIME type from source if possible
      const mimeMatch = src.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

      resolve(canvas.toDataURL(mimeType));
    };

    img.onerror = (err) => reject(err);
  });
};
