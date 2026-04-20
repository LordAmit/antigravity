import type { AppConfig, ImageItem } from './types';

// Helper to calculate X/Y based on a 9-point grid relative to canvas size
function getPositionalCoords(
  canvasW: number,
  canvasH: number,
  position: string,
  padX: number,
  padY: number
) {
  let x = canvasW / 2;
  let y = canvasH - padY; 
  
  if (position.includes('Center') && position !== 'Center') {
    x = canvasW / 2;
  } else if (position.includes('Right')) {
    x = canvasW - padX; 
  } else if (position.includes('Left')) {
    x = padX;
  } else if (position === 'Center') {
    x = canvasW / 2;
    y = canvasH / 2;
  }

  if (position.includes('Top')) {
    y = padY;
  } else if (position.includes('Bottom')) {
    y = canvasH - padY;
  }

  return { x, y };
}

export const renderPhotoBorder = (
  canvas: HTMLCanvasElement,
  image: ImageItem,
  imgObject: HTMLImageElement,
  config: AppConfig,
  logoImgObject?: HTMLImageElement | null
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const maxRes = 6000;
  let scaleLimit = 1;
  const longestEdge = Math.max(imgObject.width, imgObject.height);
  if (longestEdge > maxRes) {
    scaleLimit = maxRes / longestEdge;
  }

  let targetRatio = imgObject.width / imgObject.height;
  if (config.layout.aspectRatio !== "Original") {
    const [w, h] = config.layout.aspectRatio.split(':').map(Number);
    if (w && h) targetRatio = w / h;
  }

  let baseLength = longestEdge * scaleLimit;
  let cWidth, cHeight;
  if (targetRatio > 1) { 
    cWidth = baseLength;
    cHeight = baseLength / targetRatio;
  } else { 
    cHeight = baseLength;
    cWidth = baseLength * targetRatio;
  }

  canvas.width = cWidth;
  canvas.height = cHeight;

  const minEdge = Math.min(cWidth, cHeight);
  const borderPadding = minEdge * config.layout.borderWidthScale;

  let tWidth = cWidth - (borderPadding * 2);
  let tHeight = cHeight - (borderPadding * 2);

  // safe clamp exactly at center to prevent negative scale crashes
  if (tWidth < 10) tWidth = 10;
  if (tHeight < 10) tHeight = 10;

  if (config.layout.backgroundType === 'color') {
    ctx.fillStyle = config.layout.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.save();
    const coverRatio = Math.max(canvas.width / imgObject.width, canvas.height / imgObject.height);
    const coverW = imgObject.width * coverRatio;
    const coverH = imgObject.height * coverRatio;
    const coverX = (canvas.width - coverW) / 2;
    const coverY = (canvas.height - coverH) / 2;
    
    const blurScale = config.layout.backgroundBlurScale;
    if (blurScale > 0) {
      // Create a small buffer for performance blur (around 400-800px max)
      const bufferScale = Math.min(1, 800 / Math.max(canvas.width, canvas.height));
      const bW = Math.max(1, Math.floor(canvas.width * bufferScale));
      const bH = Math.max(1, Math.floor(canvas.height * bufferScale));
      
      const buffer = document.createElement('canvas');
      buffer.width = bW;
      buffer.height = bH;
      const bCtx = buffer.getContext('2d');
      
      if (bCtx) {
        // Draw image to small buffer first
        bCtx.drawImage(imgObject, coverX * bufferScale, coverY * bufferScale, coverW * bufferScale, coverH * bufferScale);
        
        // Apply blur to the small buffer (fast)
        const blurPx = (baseLength * blurScale) * bufferScale;
        
        if ('filter' in bCtx) {
          bCtx.filter = `blur(${blurPx}px)`;
          // Re-draw itself to apply filter
          bCtx.drawImage(buffer, 0, 0);
        } else {
          // Minimal fallback: if filters are totally missing, we already have a low-res effect from downsampling
          // Optionally we could do a secondary offset-draw but usually downsampling is enough of a "look" for background
        }
        
        // Draw small blurred buffer back to main canvas (upscaling adds further smoothness)
        ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.drawImage(imgObject, coverX, coverY, coverW, coverH);
    }
    
    if (config.layout.backgroundDimScale > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${config.layout.backgroundDimScale})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  }

  const boxW = tWidth;
  const boxH = tHeight;
  const imgRatio = imgObject.width / imgObject.height;
  
  // calculate inner paddings
  const innerPadTop = baseLength * config.layout.innerBorderTopScale;
  const innerPadBottom = baseLength * config.layout.innerBorderBottomScale;
  const innerPadSide = baseLength * config.layout.innerBorderSideScale;

  const availableImgW = boxW - (innerPadSide * 2);
  const availableImgH = boxH - (innerPadTop + innerPadBottom);
  
  let drawImgW, drawImgH;
  if (imgRatio > availableImgW / availableImgH) {
    drawImgW = availableImgW;
    drawImgH = availableImgW / imgRatio;
  } else {
    drawImgH = availableImgH;
    drawImgW = availableImgH * imgRatio;
  }

  const blockW = drawImgW + (innerPadSide * 2);
  const blockH = drawImgH + innerPadTop + innerPadBottom;

  const blockX = (canvas.width - blockW) / 2;
  const blockY = (canvas.height - blockH) / 2;

  ctx.save();
  const radius = baseLength * config.layout.imageRadiusScale;
  const shadowBlur = baseLength * config.layout.imageShadowBlurScale;

  if (shadowBlur > 0) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = shadowBlur * 0.3; 
  }

  // Ensure inner border relies on its color
  ctx.fillStyle = config.layout.innerBorderColor;
  ctx.beginPath();
  if (ctx.roundRect && radius > 0) {
     ctx.roundRect(blockX, blockY, blockW, blockH, radius);
  } else {
     ctx.rect(blockX, blockY, blockW, blockH);
  }
  
  ctx.fill(); // Fill inner border block (and draws shadow)

  if (shadowBlur > 0) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  if (radius > 0) {
    ctx.clip(); // restrict image bounds
  }
  
  // Finally draw image on top of inner border block
  const drawX = blockX + innerPadSide;
  const drawY = blockY + innerPadTop;
  const innerRadius = baseLength * (config.layout.innerImageRadiusScale || 0);
  const innerShadow = baseLength * (config.layout.innerImageShadowBlurScale || 0);

  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect && innerRadius > 0) {
      ctx.roundRect(drawX, drawY, drawImgW, drawImgH, innerRadius);
  } else {
      ctx.rect(drawX, drawY, drawImgW, drawImgH);
  }

  if (innerShadow > 0) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = innerShadow;
      ctx.shadowOffsetY = innerShadow * 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.fill(); // fills rect to cast a proper physical shadow behind inner image
      // disable shadow so drawing the actual image doesn't cast double overlay
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
  }

  if (innerRadius > 0) {
      ctx.clip();
  }
  ctx.drawImage(imgObject, drawX, drawY, drawImgW, drawImgH);
  ctx.restore();

  ctx.restore();

  const baseSize = Math.max(canvas.width, canvas.height);

  // EXIF
  if (config.exifPills.show && image.exif) {
    const { exifPills } = config;
    const { focalLength, fNumber, iso, exposureTime, lensModel, make, model, date } = image.exif;
    
    const finalCameraText = exifPills.customCameraText || [make, model].filter(Boolean).join(' ');
    const finalLensText = exifPills.customLensText || lensModel;

    const dataPairs = [];
    if (exifPills.showFocal && focalLength) dataPairs.push({ top: focalLength.toString(), bottom: 'mm' });
    if (exifPills.showAperture && fNumber) dataPairs.push({ top: fNumber.toString(), bottom: 'F' });
    if (exifPills.showIso && iso) dataPairs.push({ top: iso.toString(), bottom: 'ISO' });
    if (exifPills.showShutter && exposureTime) dataPairs.push({ top: exposureTime.toString(), bottom: 'S' });
    if (exifPills.showLens && finalLensText) dataPairs.push({ top: finalLensText, bottom: 'LENS' });
    if (exifPills.showCamera && finalCameraText) dataPairs.push({ top: finalCameraText, bottom: 'CAMERA' });
    if (exifPills.showDate && date) dataPairs.push({ top: date.toString(), bottom: 'DATE' });

    if (dataPairs.length > 0) {
      const fontSize = baseSize * exifPills.fontSizeScale;
      const boxHeight = fontSize + (baseSize * exifPills.paddingYScale);
      const gap = baseSize * 0.02;
      
      // Calculate dynamic pill widths
      let totalWidth = 0;
      const padXPill = baseSize * exifPills.paddingXScale; 
      
      const measuredPairs = dataPairs.map(p => {
        ctx.font = `600 ${fontSize}px "${exifPills.fontFamily.replace(/"/g, '')}", sans-serif`;
        const topMetrics = ctx.measureText(p.top);
        ctx.font = `400 ${fontSize * 0.6}px "${exifPills.fontFamily.replace(/"/g, '')}", sans-serif`;
        const botMetrics = ctx.measureText(p.bottom);
        const w = Math.max(topMetrics.width, botMetrics.width) + padXPill;
        return { ...p, width: w };
      });
      
      measuredPairs.forEach(p => totalWidth += p.width);
      totalWidth += gap * (measuredPairs.length - 1);
      
      // Text Grid Anchor for EXIF
      const padX = canvas.width * 0.05;
      const padY = canvas.height * 0.05;
      const anchorPos = getPositionalCoords(canvas.width, canvas.height, exifPills.position, padX, padY);

      // Apply User Offsets
      const offsetX = exifPills.positionXScale * canvas.width;
      const offsetY = exifPills.positionYScale * canvas.height;

      let startX = anchorPos.x + offsetX;
      if (exifPills.position.includes('Right')) startX -= totalWidth;
      else if (exifPills.position.includes('Center')) startX -= (totalWidth / 2);
      
      let y = anchorPos.y + offsetY;
      if (exifPills.position.includes('Top')) y += (boxHeight / 2) + padY; // move down from top edge slightly
      else if (exifPills.position.includes('Bottom')) y -= (boxHeight / 2);

      let currentX = startX;

      measuredPairs.forEach((pair) => {
        ctx.lineWidth = baseSize * exifPills.borderWidthScale;
        ctx.strokeStyle = exifPills.borderColor;
        ctx.fillStyle = exifPills.boxColor;

        ctx.beginPath();
        if (ctx.roundRect) {
           ctx.roundRect(currentX, y, pair.width, boxHeight, baseSize * 0.005);
        } else {
           ctx.rect(currentX, y, pair.width, boxHeight);
        }
        ctx.fill();
        if (ctx.lineWidth > 0) ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Top Text
        ctx.font = `600 ${fontSize}px "${exifPills.fontFamily.replace(/"/g, '')}", sans-serif`;
        if (exifPills.textStrokeWidthScale > 0) {
            ctx.lineWidth = baseSize * exifPills.textStrokeWidthScale;
            ctx.strokeStyle = exifPills.textStrokeColor;
            ctx.strokeText(pair.top, currentX + pair.width / 2, y + boxHeight * 0.35);
        }
        ctx.fillStyle = exifPills.textColor;
        ctx.fillText(pair.top, currentX + pair.width / 2, y + boxHeight * 0.35);

        // Draw Bottom Text
        ctx.font = `400 ${fontSize * 0.6}px "${exifPills.fontFamily.replace(/"/g, '')}", sans-serif`;
        if (exifPills.textStrokeWidthScale > 0) {
            ctx.lineWidth = baseSize * exifPills.textStrokeWidthScale;
            ctx.strokeStyle = exifPills.textStrokeColor;
            ctx.strokeText(pair.bottom, currentX + pair.width / 2, y + boxHeight * 0.7);
        }
        ctx.fillStyle = exifPills.textColor + 'aa';
        ctx.fillText(pair.bottom, currentX + pair.width / 2, y + boxHeight * 0.7);

        currentX += pair.width + gap;
      });
    }
  }

  // Text Labels & Linked Logo
  if (config.labels && config.labels.length > 0) {
    config.labels.forEach((label) => {
      let text = label.text
        .replace('{make}', image.exif.make || '')
        .replace('{model}', image.exif.model || '')
        .replace('{Make}', (image.exif.make || '').toUpperCase())
        .replace('{Model}', (image.exif.model || '').toUpperCase());

      const fontSize = baseSize * label.fontSizeScale;
      ctx.font = `${fontSize}px "${label.fontFamily.replace(/"/g, '')}", sans-serif`;
      
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;

      // Group Measurement for Logo + Gap
      let logoDrawW = 0;
      let logoDrawH = 0;
      let gap = 0;
      if (config.logo.dataUrl && logoImgObject) {
         const lRatio = logoImgObject.width / logoImgObject.height;
         logoDrawH = baseSize * config.logo.sizeScale;
         logoDrawW = logoDrawH * lRatio;
         gap = baseSize * config.logo.gapScale;
      }

      const totalGroupWidth = textWidth + (logoDrawW > 0 ? logoDrawW + gap : 0);

      // Align overall group block based on Typography position
      const padX = canvas.width * label.paddingXScale;
      const padY = canvas.height * label.paddingYScale;
      const { x: anchorX, y: anchorY } = getPositionalCoords(canvas.width, canvas.height, label.position, padX, padY);

      const offsetX = baseSize * (label.positionXScale || 0);
      const offsetY = baseSize * (label.positionYScale || 0);

      let startX = anchorX + offsetX;
      if (label.position.includes('Right')) startX = anchorX + offsetX - totalGroupWidth;
      else if (label.position.includes('Center')) startX = anchorX + offsetX - (totalGroupWidth / 2);

      let currentX = startX;

      // Base Y alignment (middle)
      let displayY = anchorY + offsetY;
      if (label.position.includes('Top')) displayY += fontSize / 2; // Offset since Baseline is middle
      else if (label.position.includes('Bottom')) displayY -= fontSize / 2;

      // Draw Logo First (if left)
      const logoOffsetX = baseSize * (config.logo.offsetXScale || 0);
      const logoOffsetY = baseSize * (config.logo.offsetYScale || 0);

      if (logoDrawW > 0 && config.logo.placement === 'Left of Text' && logoImgObject) {
         ctx.drawImage(logoImgObject, currentX + logoOffsetX, (displayY - (logoDrawH / 2)) + logoOffsetY, logoDrawW, logoDrawH);
         currentX += logoDrawW + gap;
      }

      // Draw Brand Text Core
      if (textWidth > 0) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        if (label.strokeWidthScale > 0) {
          ctx.lineWidth = baseSize * label.strokeWidthScale;
          ctx.strokeStyle = label.strokeColor;
          ctx.strokeText(text, currentX, displayY);
        }
        ctx.fillStyle = label.color;
        ctx.fillText(text, currentX, displayY);

        currentX += textWidth + gap;
      }

      // Draw Logo Next (if right)
      if (logoDrawW > 0 && config.logo.placement === 'Right of Text' && logoImgObject) {
         ctx.drawImage(logoImgObject, currentX + logoOffsetX, (displayY - (logoDrawH / 2)) + logoOffsetY, logoDrawW, logoDrawH);
      }
    });
  }
};
