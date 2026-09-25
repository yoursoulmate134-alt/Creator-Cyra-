import * as THREE from 'three';
import { AvatarStyle } from '../types';

/**
 * Generates an ultra-crisp, expressive stylized anime/realistic facial texture
 * for the 3D avatar head, replacing disconnected floating primitives with
 * a professional, seamless canvas map.
 */
export function generateFaceCanvas(
  style: AvatarStyle,
  eyeColor: string,
  hairColor: string,
  skinTone: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Clear transparent
  ctx.clearRect(0, 0, 1024, 1024);

  const isAnime = style === 'anime';

  // Helper: darken or lighten hex color
  const adjustColor = (hex: string, percent: number) => {
    let num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) num = 0x27272a;
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `rgb(${r}, ${g}, ${b})`;
  };

  // --- 1. CHEEK BLUSH ---
  const drawBlush = (cx: number, cy: number, rx: number, ry: number) => {
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, 'rgba(251, 113, 133, 0.42)');
    grad.addColorStop(0.5, 'rgba(253, 164, 175, 0.22)');
    grad.addColorStop(1, 'rgba(253, 164, 175, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute anime highlight marks
    if (isAnime) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 8);
      ctx.lineTo(cx - 8, cy + 8);
      ctx.moveTo(cx - 4, cy - 10);
      ctx.lineTo(cx + 4, cy + 6);
      ctx.moveTo(cx + 8, cy - 8);
      ctx.lineTo(cx + 16, cy + 8);
      ctx.stroke();
    }
    ctx.restore();
  };

  drawBlush(275, 570, 85, 48);
  drawBlush(749, 570, 85, 48);

  // --- 2. EYES ---
  const eyeY = 475;
  const leftEyeX = 330;
  const rightEyeX = 694;
  const eyeW = isAnime ? 115 : 85;
  const eyeH = isAnime ? 110 : 65;

  const drawEye = (cx: number, isRight: boolean) => {
    ctx.save();
    const flip = isRight ? -1 : 1;

    // Sclera (Eye White)
    ctx.beginPath();
    ctx.ellipse(cx, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Soft shadow under upper eyelid
    ctx.save();
    ctx.clip();
    const lidShadow = ctx.createLinearGradient(cx, eyeY - eyeH, cx, eyeY);
    lidShadow.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
    lidShadow.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = lidShadow;
    ctx.fillRect(cx - eyeW, eyeY - eyeH, eyeW * 2, eyeH);
    ctx.restore();

    // Iris
    const irisR = isAnime ? eyeW * 0.72 : eyeW * 0.58;
    const irisY = eyeY + 4;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, irisY, irisR, isAnime ? irisR * 1.15 : irisR, 0, 0, Math.PI * 2);
    ctx.clip();

    // Iris base gradient
    const irisGrad = ctx.createLinearGradient(cx, irisY - irisR, cx, irisY + irisR);
    irisGrad.addColorStop(0, '#09090b');
    irisGrad.addColorStop(0.35, adjustColor(eyeColor, -40));
    irisGrad.addColorStop(0.75, eyeColor);
    irisGrad.addColorStop(1, adjustColor(eyeColor, 40));
    ctx.fillStyle = irisGrad;
    ctx.fillRect(cx - irisR, irisY - irisR * 1.2, irisR * 2, irisR * 2.4);

    // Inner glowing ring
    const glowGrad = ctx.createRadialGradient(cx, irisY + irisR * 0.35, 2, cx, irisY + irisR * 0.35, irisR * 0.8);
    glowGrad.addColorStop(0, adjustColor(eyeColor, 60));
    glowGrad.addColorStop(0.5, eyeColor);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, irisY + irisR * 0.35, irisR * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(cx, irisY, irisR * 0.44, irisR * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Catchlights (Sparkles)
    ctx.fillStyle = '#ffffff';
    // Main glint
    ctx.beginPath();
    ctx.ellipse(cx + flip * (irisR * 0.35), irisY - irisR * 0.35, irisR * 0.32, irisR * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Secondary sparkle
    ctx.beginPath();
    ctx.arc(cx - flip * (irisR * 0.38), irisY + irisR * 0.45, irisR * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end iris clip

    // Eyelid / Upper Lash line (Thick, elegant anime winged lash)
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = isAnime ? 16 : 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.ellipse(cx, eyeY - 8, eyeW + 8, eyeH * 0.85, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();

    // Winged lash flare on outer corner
    ctx.beginPath();
    ctx.moveTo(cx - flip * (eyeW - 4), eyeY - 6);
    ctx.quadraticCurveTo(
      cx - flip * (eyeW + 18),
      eyeY - 22,
      cx - flip * (eyeW + 28),
      eyeY - 14
    );
    ctx.lineWidth = isAnime ? 12 : 7;
    ctx.stroke();

    // Double eyelid crease
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, eyeY - eyeH * 0.7 - 8, eyeW * 0.78, eyeH * 0.4, 0, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Lower subtle lash line
    ctx.strokeStyle = 'rgba(24, 24, 27, 0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, eyeY + 12, eyeW * 0.72, eyeH * 0.75, 0, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();

    ctx.restore();
  };

  drawEye(leftEyeX, false);
  drawEye(rightEyeX, true);

  // --- 3. EYEBROWS ---
  const drawEyebrow = (cx: number, isRight: boolean) => {
    ctx.save();
    const flip = isRight ? -1 : 1;
    const browColor = adjustColor(hairColor || '#27272a', -35);
    ctx.strokeStyle = browColor;
    ctx.lineWidth = isAnime ? 9 : 7;
    ctx.lineCap = 'round';

    const browY = eyeY - eyeH - 42;
    ctx.beginPath();
    ctx.moveTo(cx + flip * 68, browY + 6);
    ctx.quadraticCurveTo(cx, browY - 18, cx - flip * 78, browY + 10);
    ctx.stroke();
    ctx.restore();
  };

  drawEyebrow(leftEyeX, false);
  drawEyebrow(rightEyeX, true);

  // --- 4. CUTE ANIME NOSE ---
  ctx.save();
  ctx.fillStyle = 'rgba(180, 83, 9, 0.35)';
  ctx.beginPath();
  ctx.ellipse(512, 595, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(511, 592, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- 5. SWEET ANIME LIPS / SMILE ---
  ctx.save();
  const mouthY = 690;
  // Smile line
  ctx.strokeStyle = '#881337';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(470, mouthY);
  ctx.quadraticCurveTo(512, mouthY + 18, 554, mouthY);
  ctx.stroke();

  // Lip gloss / tint
  const lipGrad = ctx.createRadialGradient(512, mouthY + 10, 0, 512, mouthY + 10, 32);
  lipGrad.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
  lipGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = lipGrad;
  ctx.beginPath();
  ctx.ellipse(512, mouthY + 10, 34, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft white lip highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.ellipse(512, mouthY + 14, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  return canvas;
}

/**
 * Creates a cached Three.js CanvasTexture for the face
 */
export function createAvatarFaceTexture(
  style: AvatarStyle,
  eyeColor: string,
  hairColor: string,
  skinTone: string
): THREE.CanvasTexture {
  const canvas = generateFaceCanvas(style, eyeColor, hairColor, skinTone);
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
