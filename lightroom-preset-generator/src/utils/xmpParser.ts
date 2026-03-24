import { defaultSettings } from './xmpGenerator';
import type { PresetData, Point } from './xmpGenerator';

export const parseXMP = (xmlString: string): Partial<PresetData> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const desc = xmlDoc.getElementsByTagName('rdf:Description')[0];
  
  if (!desc) {
    throw new Error('Invalid XMP file: No rdf:Description found.');
  }

  const getNum = (attr: string, fallback: number): number => {
    let val = desc.getAttribute(attr);
    
    // Fallback: Adobe frequently alternates between storing XMP properties as inline attributes vs child XML nodes.
    if (val === null) {
      const childNode = desc.getElementsByTagName(attr)[0];
      if (childNode && childNode.textContent) {
        val = childNode.textContent;
      }
    }

    if (val === null || val === '') return fallback;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? fallback : parsed;
  };

  const parseCurve = (tagName: string): Point[] => {
    const curveNode = xmlDoc.getElementsByTagName(tagName)[0];
    if (!curveNode) return [{ x: 0, y: 0 }, { x: 255, y: 255 }];
    const seq = curveNode.getElementsByTagName('rdf:Seq')[0];
    if (!seq) return [{ x: 0, y: 0 }, { x: 255, y: 255 }];
    const lis = seq.getElementsByTagName('rdf:li');
    const points: Point[] = [];
    for (let i = 0; i < lis.length; i++) {
        const text = lis[i].textContent || "";
        const parts = text.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            points.push({ x: parts[0], y: parts[1] });
        }
    }
    return points.length >= 2 ? points : [{ x: 0, y: 0 }, { x: 255, y: 255 }];
  };

  return {
    exposure: getNum('crs:Exposure2012', defaultSettings.exposure),
    contrast: getNum('crs:Contrast2012', defaultSettings.contrast),
    highlights: getNum('crs:Highlights2012', defaultSettings.highlights),
    shadows: getNum('crs:Shadows2012', defaultSettings.shadows),
    whites: getNum('crs:Whites2012', defaultSettings.whites),
    blacks: getNum('crs:Blacks2012', defaultSettings.blacks),
    
    temp: getNum('crs:IncrementalTemperature', getNum('crs:Temperature', defaultSettings.temp)),
    tint: getNum('crs:IncrementalTint', getNum('crs:Tint', defaultSettings.tint)),
    vibrance: getNum('crs:Vibrance', defaultSettings.vibrance),
    saturation: getNum('crs:Saturation', defaultSettings.saturation),
    
    reds: {
      hue: getNum('crs:HueAdjustmentRed', defaultSettings.reds.hue),
      saturation: getNum('crs:SaturationAdjustmentRed', defaultSettings.reds.saturation),
      luminance: getNum('crs:LuminanceAdjustmentRed', defaultSettings.reds.luminance)
    },
    oranges: {
      hue: getNum('crs:HueAdjustmentOrange', defaultSettings.oranges.hue),
      saturation: getNum('crs:SaturationAdjustmentOrange', defaultSettings.oranges.saturation),
      luminance: getNum('crs:LuminanceAdjustmentOrange', defaultSettings.oranges.luminance)
    },
    yellows: {
      hue: getNum('crs:HueAdjustmentYellow', defaultSettings.yellows.hue),
      saturation: getNum('crs:SaturationAdjustmentYellow', defaultSettings.yellows.saturation),
      luminance: getNum('crs:LuminanceAdjustmentYellow', defaultSettings.yellows.luminance)
    },
    greens: {
      hue: getNum('crs:HueAdjustmentGreen', defaultSettings.greens.hue),
      saturation: getNum('crs:SaturationAdjustmentGreen', defaultSettings.greens.saturation),
      luminance: getNum('crs:LuminanceAdjustmentGreen', defaultSettings.greens.luminance)
    },
    aquas: {
      hue: getNum('crs:HueAdjustmentAqua', defaultSettings.aquas.hue),
      saturation: getNum('crs:SaturationAdjustmentAqua', defaultSettings.aquas.saturation),
      luminance: getNum('crs:LuminanceAdjustmentAqua', defaultSettings.aquas.luminance)
    },
    blues: {
      hue: getNum('crs:HueAdjustmentBlue', defaultSettings.blues.hue),
      saturation: getNum('crs:SaturationAdjustmentBlue', defaultSettings.blues.saturation),
      luminance: getNum('crs:LuminanceAdjustmentBlue', defaultSettings.blues.luminance)
    },
    purples: {
      hue: getNum('crs:HueAdjustmentPurple', defaultSettings.purples.hue),
      saturation: getNum('crs:SaturationAdjustmentPurple', defaultSettings.purples.saturation),
      luminance: getNum('crs:LuminanceAdjustmentPurple', defaultSettings.purples.luminance)
    },
    magentas: {
      hue: getNum('crs:HueAdjustmentMagenta', defaultSettings.magentas.hue),
      saturation: getNum('crs:SaturationAdjustmentMagenta', defaultSettings.magentas.saturation),
      luminance: getNum('crs:LuminanceAdjustmentMagenta', defaultSettings.magentas.luminance)
    },
    
    colorGrading: {
      global: {
        hue: getNum('crs:ColorGradeGlobalHue', defaultSettings.colorGrading.global.hue),
        saturation: getNum('crs:ColorGradeGlobalSat', defaultSettings.colorGrading.global.saturation),
        luminance: getNum('crs:ColorGradeGlobalLum', defaultSettings.colorGrading.global.luminance)
      },
      shadows: {
        hue: getNum('crs:SplitToningShadowHue', getNum('crs:ColorGradeShadowHue', defaultSettings.colorGrading.shadows.hue)),
        saturation: getNum('crs:SplitToningShadowSaturation', getNum('crs:ColorGradeShadowSat', defaultSettings.colorGrading.shadows.saturation)),
        luminance: getNum('crs:ColorGradeShadowLum', defaultSettings.colorGrading.shadows.luminance)
      },
      midtones: {
        hue: getNum('crs:ColorGradeMidtoneHue', defaultSettings.colorGrading.midtones.hue),
        saturation: getNum('crs:ColorGradeMidtoneSat', defaultSettings.colorGrading.midtones.saturation),
        luminance: getNum('crs:ColorGradeMidtoneLum', defaultSettings.colorGrading.midtones.luminance)
      },
      highlights: {
        hue: getNum('crs:SplitToningHighlightHue', getNum('crs:ColorGradeHighlightHue', defaultSettings.colorGrading.highlights.hue)),
        saturation: getNum('crs:SplitToningHighlightSaturation', getNum('crs:ColorGradeHighlightSat', defaultSettings.colorGrading.highlights.saturation)),
        luminance: getNum('crs:ColorGradeHighlightLum', defaultSettings.colorGrading.highlights.luminance)
      },
      blending: getNum('crs:ColorGradeBlending', defaultSettings.colorGrading.blending),
      balance: getNum('crs:SplitToningBalance', getNum('crs:ColorGradeBalance', defaultSettings.colorGrading.balance))
    },
    
    texture: getNum('crs:Texture', defaultSettings.texture),
    clarity: getNum('crs:Clarity2012', defaultSettings.clarity),
    dehaze: getNum('crs:Dehaze', defaultSettings.dehaze),
    
    grain: {
      amount: getNum('crs:GrainAmount', defaultSettings.grain.amount),
      size: getNum('crs:GrainSize', defaultSettings.grain.size),
      roughness: getNum('crs:GrainFrequency', defaultSettings.grain.roughness)
    },
    
    vignetteAmount: getNum('crs:PostCropVignetteAmount', defaultSettings.vignetteAmount),
    vignetteMidpoint: getNum('crs:PostCropVignetteMidpoint', defaultSettings.vignetteMidpoint),
    vignetteRoundness: getNum('crs:PostCropVignetteRoundness', defaultSettings.vignetteRoundness),
    vignetteFeather: getNum('crs:PostCropVignetteFeather', defaultSettings.vignetteFeather),
    vignetteHighlights: getNum('crs:PostCropVignetteHighlightContrast', defaultSettings.vignetteHighlights),
    
    noiseReduction: getNum('crs:LuminanceSmoothing', defaultSettings.noiseReduction),
    noiseDetail: getNum('crs:LuminanceNoiseReductionDetail', defaultSettings.noiseDetail),
    noiseContrast: getNum('crs:LuminanceNoiseReductionContrast', defaultSettings.noiseContrast),
    colorNoiseReduction: getNum('crs:ColorNoiseReduction', defaultSettings.colorNoiseReduction),
    
    sharpening: {
      amount: getNum('crs:Sharpness', defaultSettings.sharpening.amount),
      radius: getNum('crs:SharpenRadius', defaultSettings.sharpening.radius),
      detail: getNum('crs:SharpenDetail', defaultSettings.sharpening.detail),
      masking: getNum('crs:SharpenEdgeMasking', defaultSettings.sharpening.masking)
    },
    
    parametricHighlights: getNum('crs:ParametricHighlights', defaultSettings.parametricHighlights),
    parametricLights: getNum('crs:ParametricLights', defaultSettings.parametricLights),
    parametricDarks: getNum('crs:ParametricDarks', defaultSettings.parametricDarks),
    parametricShadows: getNum('crs:ParametricShadows', defaultSettings.parametricShadows),
    
    advanced: {
      rgbCurve: parseCurve('crs:ToneCurvePV2012'),
      redCurve: parseCurve('crs:ToneCurvePV2012Red'),
      greenCurve: parseCurve('crs:ToneCurvePV2012Green'),
      blueCurve: parseCurve('crs:ToneCurvePV2012Blue'),
    }
  };
};

export const parsePresetName = (xmlString: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const nameNodes = xmlDoc.getElementsByTagName('crs:Name');
    if (nameNodes.length > 0) {
      const li = nameNodes[0].getElementsByTagName('rdf:li')[0];
      if (li && li.textContent) return li.textContent;
    }
  } catch(e) {}
  return "Imported Preset";
};
