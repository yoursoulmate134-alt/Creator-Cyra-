import { PatternType } from '../types';

/**
 * Generates a high quality seamless canvas texture data URL based on pattern type and colors
 */
export function generatePatternCanvasUrl(
  pattern: PatternType,
  primaryColor: string,
  secondaryColor: string,
  size = 512
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Base background
  ctx.fillStyle = secondaryColor || '#ffffff';
  ctx.fillRect(0, 0, size, size);

  switch (pattern) {
    case 'cherry_blossom': {
      // Soft fabric weave background
      ctx.fillStyle = secondaryColor || '#fff0f5';
      ctx.fillRect(0, 0, size, size);

      // Weave grain
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      for (let i = 0; i < size; i += 4) {
        ctx.fillRect(0, i, size, 1);
        ctx.fillRect(i, 0, 1, size);
      }

      // Draw seamless cherry blossoms
      const drawPetal = (x: number, y: number, r: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-r * 0.5, -r * 0.8, -r * 0.3, -r * 1.4, 0, -r * 1.5);
        ctx.bezierCurveTo(r * 0.3, -r * 1.4, r * 0.5, -r * 0.8, 0, 0);
        ctx.fillStyle = primaryColor || '#ff99b6';
        ctx.fill();
        ctx.restore();
      };

      const drawFlower = (cx: number, cy: number, radius: number) => {
        for (let p = 0; p < 5; p++) {
          drawPetal(cx, cy, radius, (p * Math.PI * 2) / 5);
        }
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe066';
        ctx.fill();
      };

      // Flower positions that seamlessly wrap around 512x512
      const flowerCoords = [
        [128, 128, 28],
        [384, 128, 24],
        [128, 384, 25],
        [384, 384, 30],
        [256, 256, 34],
        [0, 256, 22],
        [512, 256, 22],
        [256, 0, 26],
        [256, 512, 26],
      ];

      flowerCoords.forEach(([x, y, r]) => drawFlower(x, y, r));
      break;
    }

    case 'plaid': {
      const step = size / 8;
      ctx.fillStyle = primaryColor;
      for (let i = 0; i < size; i += step * 2) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(i, 0, step, size);
        ctx.fillRect(0, i, size, step);
      }
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4;
      for (let i = step; i < size; i += step * 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }
      break;
    }

    case 'houndstooth': {
      const tile = size / 8;
      ctx.fillStyle = primaryColor;
      for (let y = 0; y < size; y += tile) {
        for (let x = 0; x < size; x += tile) {
          if ((x / tile + y / tile) % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + tile, y);
            ctx.lineTo(x + tile / 2, y + tile);
            ctx.lineTo(x, y + tile / 2);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      break;
    }

    case 'stripes': {
      const barWidth = size / 16;
      ctx.fillStyle = primaryColor;
      for (let i = 0; i < size; i += barWidth * 2) {
        ctx.fillRect(i, 0, barWidth, size);
      }
      break;
    }

    case 'dots': {
      const spacing = size / 8;
      const radius = spacing * 0.25;
      ctx.fillStyle = primaryColor;
      for (let y = spacing / 2; y < size; y += spacing) {
        for (let x = spacing / 2; x < size; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'cyber_grid': {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, size, size);

      // Grid lines
      const step = size / 16;
      ctx.strokeStyle = primaryColor || '#06b6d4';
      ctx.lineWidth = 2;
      ctx.shadowColor = primaryColor || '#06b6d4';
      ctx.shadowBlur = 6;

      for (let i = 0; i <= size; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }

      // Small glowing nodes
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      for (let i = step * 2; i < size; i += step * 4) {
        for (let j = step * 2; j < size; j += step * 4) {
          ctx.beginPath();
          ctx.arc(i, j, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'stars': {
      ctx.fillStyle = primaryColor;
      const drawStar = (cx: number, cy: number, spikes = 5, outerRadius = 12, innerRadius = 5) => {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
      };

      const stars = [
        [64, 64],
        [256, 120],
        [440, 70],
        [180, 300],
        [360, 260],
        [100, 440],
        [400, 430],
      ];
      stars.forEach(([x, y]) => drawStar(x, y));
      break;
    }

    default:
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, 0, size, size);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Converts an uploaded photo / image into a seamless repeating fabric texture
 * using edge cross-fade blending.
 */
export async function convertImageToSeamlessTexture(
  imageSource: string,
  targetSize = 512,
  blendRatio = 0.25
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSource);
        return;
      }

      // Step 1: Draw centered scaled image onto canvas
      ctx.drawImage(img, 0, 0, targetSize, targetSize);

      // Step 2: Edge wrap blending for seamlessness
      const halfW = targetSize / 2;
      const halfH = targetSize / 2;

      // Create a temporary buffer
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetSize;
      tempCanvas.height = targetSize;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      // Offset by half: top-left goes to bottom-right, etc.
      tempCtx.drawImage(canvas, 0, 0, halfW, halfH, halfW, halfH, halfW, halfH);
      tempCtx.drawImage(canvas, halfW, 0, halfW, halfH, 0, halfH, halfW, halfH);
      tempCtx.drawImage(canvas, 0, halfH, halfW, halfH, halfW, 0, halfW, halfH);
      tempCtx.drawImage(canvas, halfW, halfH, halfW, halfH, 0, 0, halfW, halfH);

      // Now create smooth linear fade across seam lines
      const seamSize = Math.floor(targetSize * blendRatio);
      
      // Horizontal seam gradient
      const hGrad = ctx.createLinearGradient(0, halfH - seamSize, 0, halfH + seamSize);
      hGrad.addColorStop(0, 'rgba(255,255,255,0)');
      hGrad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
      hGrad.addColorStop(1, 'rgba(255,255,255,0)');

      tempCtx.fillStyle = hGrad;
      tempCtx.fillRect(0, halfH - seamSize, targetSize, seamSize * 2);

      // Vertical seam gradient
      const vGrad = ctx.createLinearGradient(halfW - seamSize, 0, halfW + seamSize, 0);
      vGrad.addColorStop(0, 'rgba(255,255,255,0)');
      vGrad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
      vGrad.addColorStop(1, 'rgba(255,255,255,0)');

      tempCtx.fillStyle = vGrad;
      tempCtx.fillRect(halfW - seamSize, 0, seamSize * 2, targetSize);

      resolve(tempCanvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for seamless processing'));
    };

    img.src = imageSource;
  });
}
