import type { AppConfig, ImageItem } from './types';

// Helper to calculate X/Y based on a 9-point grid relative to a container
type Alignment = 'left' | 'center' | 'right';
type VAlignment = 'top' | 'middle' | 'bottom';

function getPreciseAnchor(
  containerW: number,
  containerH: number,
  imgH: number,
  padTop: number,
  padBottom: number,
  padSide: number,
  position: string,
  customPadX: number,
  customPadY: number
): { x: number; y: number; align: Alignment; vAlign: VAlignment } {
  // Coordinates are relative to the top-left of the entire card block (container)
  const map: Record<string, { x: number; y: number; align: Alignment; vAlign: VAlignment }> = {
    'Top Left':      { x: customPadX || (padSide / 2),     y: customPadY || (padTop / 2),      align: 'left',   vAlign: 'middle' },
    'Top Center':    { x: containerW / 2,                  y: customPadY || (padTop / 2),      align: 'center', vAlign: 'middle' },
    'Top Right':     { x: containerW - (customPadX || (padSide / 2)), y: customPadY || (padTop / 2), align: 'right',  vAlign: 'middle' },
    'Middle Left':   { x: customPadX || (padSide / 2),     y: padTop + (imgH / 2),             align: 'left',   vAlign: 'middle' },
    'Center':        { x: containerW / 2,                  y: padTop + (imgH / 2),             align: 'center', vAlign: 'middle' },
    'Middle Right':  { x: containerW - (customPadX || (padSide / 2)), y: padTop + (imgH / 2),    align: 'right',  vAlign: 'middle' },
    'Bottom Left':   { x: customPadX || (padSide / 2),     y: containerH - (customPadY || (padBottom / 2)), align: 'left', vAlign: 'middle' },
    'Bottom Center': { x: containerW / 2,                  y: containerH - (customPadY || (padBottom / 2)), align: 'center', vAlign: 'middle' },
    'Bottom Right':  { x: containerW - (customPadX || (padSide / 2)), y: containerH - (customPadY || (padBottom / 2)), align: 'right', vAlign: 'middle' },
  };

  return map[position] || map['Bottom Center'];
}

export const renderPhotoBorder = (
  canvas: HTMLCanvasElement,
  image: ImageItem,
  imgObject: HTMLImageElement,
  config: AppConfig,
  _logoImgObject?: HTMLImageElement | null
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const maxRes = 8000;
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
  const outerPadding = minEdge * config.layout.borderWidthScale;

  // Background
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
      
      const blurPx = baseLength * config.layout.backgroundBlurScale;
      ctx.filter = `blur(${blurPx}px)`;
      ctx.drawImage(imgObject, coverX, coverY, coverW, coverH);
      
      ctx.filter = 'none';
      if (config.layout.backgroundDimScale > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${config.layout.backgroundDimScale})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
  }

  // Calculate sizes for the inner card and photo
  const boxW = cWidth - (outerPadding * 2);
  const boxH = cHeight - (outerPadding * 2);
  
  const innerPadTop = baseLength * config.layout.innerBorderTopScale;
  const innerPadBottom = baseLength * config.layout.innerBorderBottomScale;
  const innerPadSide = baseLength * config.layout.innerBorderSideScale;

  const imgRatio = imgObject.width / imgObject.height;
  const photoPadding = baseLength * (config.layout.imagePaddingScale || 0);
  const availableImgW = boxW - (innerPadSide * 2) - (photoPadding * 2);
  const availableImgH = boxH - (innerPadTop + innerPadBottom) - (photoPadding * 2);
  
  let drawImgW, drawImgH;
  if (imgRatio > availableImgW / availableImgH) {
    drawImgW = availableImgW;
    drawImgH = availableImgW / imgRatio;
  } else {
    drawImgH = availableImgH;
    drawImgW = availableImgH * imgRatio;
  }

  const cardW = drawImgW + (innerPadSide * 2) + (photoPadding * 2);
  const cardH = drawImgH + innerPadTop + innerPadBottom + (photoPadding * 2);

  const cardX = (canvas.width - cardW) / 2;
  const cardY = (canvas.height - cardH) / 2;

  // Draw Inner Card Border (White block)
  ctx.save();
  const radius = baseLength * config.layout.imageRadiusScale;
  const shadowBlur = baseLength * config.layout.imageShadowBlurScale;

  if (shadowBlur > 0) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = shadowBlur * 0.3; 
  }

  ctx.fillStyle = config.layout.innerBorderColor;
  ctx.beginPath();
  if (ctx.roundRect && radius > 0) {
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  } else {
      ctx.rect(cardX, cardY, cardW, cardH);
  }
  ctx.fill();
  ctx.restore();

  // Draw Actual Photo
  const photoX = cardX + innerPadSide + photoPadding;
  const photoY = cardY + innerPadTop + photoPadding;
  const photoRadius = baseLength * (config.layout.innerImageRadiusScale || 0);
  const photoShadow = baseLength * (config.layout.innerImageShadowBlurScale || 0);

  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect && photoRadius > 0) {
      ctx.roundRect(photoX, photoY, drawImgW, drawImgH, photoRadius);
  } else {
      ctx.rect(photoX, photoY, drawImgW, drawImgH);
  }

  if (photoShadow > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = photoShadow;
      ctx.shadowOffsetY = photoShadow * 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
  }

  if (photoRadius > 0) {
      ctx.clip();
  }
  ctx.drawImage(imgObject, photoX, photoY, drawImgW, drawImgH);
  ctx.restore();

  // Resolve Templates
  const resolveTemplate = (raw: string) => {
    return raw
      .replace(/{make}/gi, String(image.exif.make || ''))
      .replace(/{model}/gi, String(image.exif.model || ''))
      .replace(/{lens}/gi, String(image.exif.lensModel || ''))
      .replace(/{iso}/gi, String(image.exif.iso || ''))
      .replace(/{focal}/gi, String(image.exif.focalLength || ''))
      .replace(/{f}/gi, String(image.exif.fNumber || ''))
      .replace(/{shutter}/gi, String(image.exif.exposureTime || ''))
      .replace(/{date}/gi, String(image.exif.date || ''))
      .trim();
  };

  // EXIF Pills
  if (config.exifPills.show && image.exif) {
    const { exifPills } = config;
    const dataPairs = [];
    if (exifPills.showFocal && image.exif.focalLength) dataPairs.push({ top: image.exif.focalLength.toString(), bottom: 'mm' });
    if (exifPills.showAperture && image.exif.fNumber) dataPairs.push({ top: image.exif.fNumber.toString(), bottom: 'F' });
    if (exifPills.showIso && image.exif.iso) dataPairs.push({ top: image.exif.iso.toString(), bottom: 'ISO' });
    if (exifPills.showShutter && image.exif.exposureTime) dataPairs.push({ top: image.exif.exposureTime.toString(), bottom: 'S' });
    if (exifPills.showLens && image.exif.lensModel) dataPairs.push({ top: resolveTemplate(exifPills.customLensText || '{lens}'), bottom: 'LENS' });
    if (exifPills.showCamera && (image.exif.make || image.exif.model)) dataPairs.push({ top: resolveTemplate(exifPills.customCameraText || '{make} {model}'), bottom: 'CAMERA' });
    if (exifPills.showDate && image.exif.date) dataPairs.push({ top: image.exif.date.toString(), bottom: 'DATE' });

    if (dataPairs.length > 0) {
      const fontSize = baseLength * exifPills.fontSizeScale;
      const boxPadding = fontSize * (exifPills.internalPaddingScale || 0.5);
      const boxHeight = fontSize * 1.8;
      const gap = baseLength * 0.01;
      
      let totalWidth = 0;
      const padXPill = boxPadding * 2; 
      
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
      
      const anchor = getPreciseAnchor(
        cardW, cardH, drawImgH, 
        innerPadTop, innerPadBottom, innerPadSide, 
        exifPills.position, 
        baseLength * exifPills.paddingXScale, 
        baseLength * exifPills.paddingYScale
      );
      
      const offsetX = exifPills.positionXScale * baseLength;
      const offsetY = exifPills.positionYScale * baseLength;

      let startX = cardX + anchor.x + offsetX;
      if (anchor.align === 'right') startX -= totalWidth;
      else if (anchor.align === 'center') startX -= (totalWidth / 2);

      let startY = cardY + anchor.y + offsetY;
      if (anchor.vAlign === 'middle') startY -= (boxHeight / 2);
      else if (anchor.vAlign === 'bottom') startY -= boxHeight;

      let currentX = startX;
      measuredPairs.forEach((pair) => {
        ctx.lineWidth = baseLength * exifPills.borderWidthScale;
        ctx.strokeStyle = exifPills.borderColor;
        ctx.fillStyle = exifPills.boxColor;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(currentX, startY, pair.width, boxHeight, baseLength * 0.005);
        else ctx.rect(currentX, startY, pair.width, boxHeight);
        ctx.fill();
        if (ctx.lineWidth > 0) ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${fontSize}px "${exifPills.fontFamily.replace(/"/g, '')}", sans-serif`;
        if (exifPills.textStrokeWidthScale > 0) {
          ctx.lineWidth = baseLength * exifPills.textStrokeWidthScale;
          ctx.strokeStyle = exifPills.textStrokeColor;
          ctx.strokeText(pair.top, currentX + pair.width / 2, startY + boxHeight * 0.35);
        }
        ctx.fillStyle = exifPills.textColor;
        ctx.fillText(pair.top, currentX + pair.width / 2, startY + boxHeight * 0.35);

        ctx.font = `400 ${fontSize * 0.6}px "${exifPills.fontFamily.replace(/"/g, '')}", sans-serif`;
        if (exifPills.textStrokeWidthScale > 0) {
          ctx.lineWidth = baseLength * (exifPills.textStrokeWidthScale * 0.6);
          ctx.strokeStyle = exifPills.textStrokeColor;
          ctx.strokeText(pair.bottom, currentX + pair.width / 2, startY + boxHeight * 0.7);
        }
        ctx.fillStyle = exifPills.textColor + 'aa';
        ctx.fillText(pair.bottom, currentX + pair.width / 2, startY + boxHeight * 0.7);

        currentX += pair.width + gap;
      });
    }
  }

  // Labels
  config.labels.forEach((label) => {
    if (!label.show || !label.text) return;
    const text = resolveTemplate(label.text);
    const fontSize = baseLength * label.fontSizeScale;
    const globalWeight = label.fontWeight || 'normal';
    const globalStyle = label.fontStyle || 'normal';
    
    // Parse rich text segments
    const segments = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean).map(s => {
      if (s.startsWith('**') && s.endsWith('**')) return { text: s.slice(2, -2), bold: true, italic: false };
      if (s.startsWith('*') && s.endsWith('*')) return { text: s.slice(1, -1), bold: false, italic: true };
      return { text: s, bold: false, italic: false };
    });

    // Measure total width
    let textWidth = 0;
    segments.forEach(seg => {
      const weight = seg.bold ? 'bold' : globalWeight;
      const style = seg.italic ? 'italic' : globalStyle;
      ctx.font = `${style} ${weight} ${fontSize}px ${label.fontFamily}, sans-serif`;
      textWidth += ctx.measureText(seg.text).width;
    });

    let logoW = 0, logoH = 0, logoGap = 0;
    if (config.logo.dataUrl && _logoImgObject) {
       logoH = baseLength * config.logo.sizeScale;
       logoW = logoH * (_logoImgObject.width / _logoImgObject.height);
       logoGap = baseLength * config.logo.gapScale;
    }

    const totalW = textWidth + (logoW > 0 ? logoW + logoGap : 0);
    const anchor = getPreciseAnchor(
      cardW, cardH, drawImgH, 
      innerPadTop, innerPadBottom, innerPadSide, 
      label.position, 
      baseLength * label.paddingXScale, 
      baseLength * label.paddingYScale
    );

    const offsetX = baseLength * (label.positionXScale || 0);
    const offsetY = baseLength * (label.positionYScale || 0);

    let startX = cardX + anchor.x + offsetX;
    if (anchor.align === 'right') startX -= totalW;
    else if (anchor.align === 'center') startX -= (totalW / 2);

    let drawY = cardY + anchor.y + offsetY;
    let currentX = startX;

    const logoOffsetX = baseLength * (config.logo.offsetXScale || 0);
    const logoOffsetY = baseLength * (config.logo.offsetYScale || 0);

    if (logoW > 0 && config.logo.placement === 'Left of Text' && _logoImgObject) {
       ctx.drawImage(_logoImgObject, currentX + logoOffsetX, drawY - (logoH / 2) + logoOffsetY, logoW, logoH);
       currentX += logoW + logoGap;
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    segments.forEach(seg => {
      const weight = seg.bold ? 'bold' : globalWeight;
      const style = seg.italic ? 'italic' : globalStyle;
      ctx.font = `${style} ${weight} ${fontSize}px ${label.fontFamily}, sans-serif`;
      
      if (label.strokeWidthScale > 0) {
        ctx.lineWidth = baseLength * label.strokeWidthScale;
        ctx.strokeStyle = label.strokeColor;
        ctx.strokeText(seg.text, currentX, drawY);
      }
      ctx.fillStyle = label.color;
      ctx.fillText(seg.text, currentX, drawY);
      currentX += ctx.measureText(seg.text).width;
    });

    if (logoW > 0 && config.logo.placement === 'Right of Text' && _logoImgObject) {
       ctx.drawImage(_logoImgObject, currentX + logoGap + logoOffsetX, drawY - (logoH / 2) + logoOffsetY, logoW, logoH);
    }
  });
};
