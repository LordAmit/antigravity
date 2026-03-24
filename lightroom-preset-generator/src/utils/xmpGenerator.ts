export interface Point {
  x: number;
  y: number;
}

export interface AdvancedSettings {
  rgbCurve: Point[];
  redCurve: Point[];
  greenCurve: Point[];
  blueCurve: Point[];
}

export interface ColorMix {
  hue: number;
  saturation: number;
  luminance: number;
}

export interface ColorGradingSettings {
  global: ColorMix;
  shadows: ColorMix;
  midtones: ColorMix;
  highlights: ColorMix;
  blending: number;
  balance: number;
}

export interface GrainSettings {
  amount: number;
  size: number;
  roughness: number;
}

export interface SharpeningSettings {
  amount: number;
  radius: number;
  detail: number;
  masking: number;
}

export interface PresetData {
  // Light Settings
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  
  // Color Settings
  temp: number;
  tint: number;
  vibrance: number;
  saturation: number;

  // Color Mix
  reds: ColorMix;
  oranges: ColorMix;
  yellows: ColorMix;
  greens: ColorMix;
  aquas: ColorMix;
  blues: ColorMix;
  purples: ColorMix;
  magentas: ColorMix;
  
  // Color Grading
  colorGrading: ColorGradingSettings;

  // Effects
  texture: number;
  clarity: number;
  dehaze: number;
  grain: GrainSettings;

  // Vignette
  vignetteAmount: number;
  vignetteMidpoint: number;
  vignetteRoundness: number;
  vignetteFeather: number;
  vignetteHighlights: number;

  // Detail
  noiseReduction: number;
  noiseDetail: number;
  noiseContrast: number;
  colorNoiseReduction: number;
  sharpening: SharpeningSettings;

  // Parametric Curve
  parametricHighlights: number;
  parametricLights: number;
  parametricDarks: number;
  parametricShadows: number;

  // Advanced Curve
  advanced: AdvancedSettings;
}

export const defaultSettings: PresetData = {
  exposure: 0, contrast: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0,
  temp: 0, tint: 0, vibrance: 0, saturation: 0,
  reds: { hue: 0, saturation: 0, luminance: 0 },
  oranges: { hue: 0, saturation: 0, luminance: 0 },
  yellows: { hue: 0, saturation: 0, luminance: 0 },
  greens: { hue: 0, saturation: 0, luminance: 0 },
  aquas: { hue: 0, saturation: 0, luminance: 0 },
  blues: { hue: 0, saturation: 0, luminance: 0 },
  purples: { hue: 0, saturation: 0, luminance: 0 },
  magentas: { hue: 0, saturation: 0, luminance: 0 },
  colorGrading: {
    global: { hue: 0, saturation: 0, luminance: 0 },
    shadows: { hue: 0, saturation: 0, luminance: 0 },
    midtones: { hue: 0, saturation: 0, luminance: 0 },
    highlights: { hue: 0, saturation: 0, luminance: 0 },
    blending: 50,
    balance: 0
  },
  texture: 0, clarity: 0, dehaze: 0,
  grain: { amount: 0, size: 25, roughness: 50 },
  vignetteAmount: 0, vignetteMidpoint: 50, vignetteRoundness: 0, vignetteFeather: 50, vignetteHighlights: 0,
  noiseReduction: 0, noiseDetail: 50, noiseContrast: 0, colorNoiseReduction: 25,
  sharpening: { amount: 40, radius: 1.0, detail: 25, masking: 0 },
  parametricHighlights: 0, parametricLights: 0, parametricDarks: 0, parametricShadows: 0,
  advanced: {
    rgbCurve: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    redCurve: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    greenCurve: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    blueCurve: [{ x: 0, y: 0 }, { x: 255, y: 255 }]
  }
};

const buildCurvePoints = (points: Point[]): string => {
  return points
    .map(p => `      <rdf:li>${Math.round(p.x)}, ${Math.round(p.y)}</rdf:li>`)
    .join('\n');
};

const sign = (val: number) => val > 0 ? '+' : '';

export const generateXMP = (data: PresetData, presetName: string = "Custom Web Preset"): string => {
  const uuid = () => 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16)).toUpperCase();

  const xmpString = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.0-c000 1.000000, 0000/00/00-00:00:00        ">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
   crs:PresetType="Normal"
   crs:Cluster=""
   crs:UUID="${uuid()}"
   crs:SupportsAmount="False"
   crs:SupportsColor="True"
   crs:SupportsMonochrome="True"
   crs:SupportsHighDynamicRange="True"
   crs:SupportsNormalDynamicRange="True"
   crs:SupportsSceneReferred="True"
   crs:SupportsOutputReferred="True"
   crs:RequiresRgbMatrix="False"
   crs:CameraModelRestriction=""
   crs:Copyright=""
   crs:ContactInfo=""
   crs:Version="15.0"
   crs:ProcessVersion="11.0"
   
   crs:Exposure2012="${sign(data.exposure)}${data.exposure.toFixed(2)}"
   crs:Contrast2012="${sign(data.contrast)}${Math.round(data.contrast)}"
   crs:Highlights2012="${Math.round(data.highlights)}"
   crs:Shadows2012="${Math.round(data.shadows)}"
   crs:Whites2012="${Math.round(data.whites)}"
   crs:Blacks2012="${Math.round(data.blacks)}"
   
   crs:IncrementalTemperature="${Math.round(data.temp)}"
   crs:IncrementalTint="${Math.round(data.tint)}"
   crs:Vibrance="${Math.round(data.vibrance)}"
   crs:Saturation="${Math.round(data.saturation)}"
   
   crs:HueAdjustmentRed="${Math.round(data.reds.hue)}"
   crs:SaturationAdjustmentRed="${Math.round(data.reds.saturation)}"
   crs:LuminanceAdjustmentRed="${Math.round(data.reds.luminance)}"
   crs:HueAdjustmentOrange="${Math.round(data.oranges.hue)}"
   crs:SaturationAdjustmentOrange="${Math.round(data.oranges.saturation)}"
   crs:LuminanceAdjustmentOrange="${Math.round(data.oranges.luminance)}"
   crs:HueAdjustmentYellow="${Math.round(data.yellows.hue)}"
   crs:SaturationAdjustmentYellow="${Math.round(data.yellows.saturation)}"
   crs:LuminanceAdjustmentYellow="${Math.round(data.yellows.luminance)}"
   crs:HueAdjustmentGreen="${Math.round(data.greens.hue)}"
   crs:SaturationAdjustmentGreen="${Math.round(data.greens.saturation)}"
   crs:LuminanceAdjustmentGreen="${Math.round(data.greens.luminance)}"
   crs:HueAdjustmentAqua="${Math.round(data.aquas.hue)}"
   crs:SaturationAdjustmentAqua="${Math.round(data.aquas.saturation)}"
   crs:LuminanceAdjustmentAqua="${Math.round(data.aquas.luminance)}"
   crs:HueAdjustmentBlue="${Math.round(data.blues.hue)}"
   crs:SaturationAdjustmentBlue="${Math.round(data.blues.saturation)}"
   crs:LuminanceAdjustmentBlue="${Math.round(data.blues.luminance)}"
   crs:HueAdjustmentPurple="${Math.round(data.purples.hue)}"
   crs:SaturationAdjustmentPurple="${Math.round(data.purples.saturation)}"
   crs:LuminanceAdjustmentPurple="${Math.round(data.purples.luminance)}"
   crs:HueAdjustmentMagenta="${Math.round(data.magentas.hue)}"
   crs:SaturationAdjustmentMagenta="${Math.round(data.magentas.saturation)}"
   crs:LuminanceAdjustmentMagenta="${Math.round(data.magentas.luminance)}"

   crs:ColorGradeGlobalHue="${Math.round(data.colorGrading.global.hue)}"
   crs:ColorGradeGlobalSat="${Math.round(data.colorGrading.global.saturation)}"
   crs:ColorGradeGlobalLum="${Math.round(data.colorGrading.global.luminance)}"
   crs:SplitToningShadowHue="${Math.round(data.colorGrading.shadows.hue)}"
   crs:SplitToningShadowSaturation="${Math.round(data.colorGrading.shadows.saturation)}"
   crs:ColorGradeShadowLum="${Math.round(data.colorGrading.shadows.luminance)}"
   crs:ColorGradeMidtoneHue="${Math.round(data.colorGrading.midtones.hue)}"
   crs:ColorGradeMidtoneSat="${Math.round(data.colorGrading.midtones.saturation)}"
   crs:ColorGradeMidtoneLum="${Math.round(data.colorGrading.midtones.luminance)}"
   crs:SplitToningHighlightHue="${Math.round(data.colorGrading.highlights.hue)}"
   crs:SplitToningHighlightSaturation="${Math.round(data.colorGrading.highlights.saturation)}"
   crs:ColorGradeHighlightLum="${Math.round(data.colorGrading.highlights.luminance)}"
   crs:ColorGradeBlending="${Math.round(data.colorGrading.blending)}"
   crs:SplitToningBalance="${Math.round(data.colorGrading.balance)}"
   
   crs:Texture="${Math.round(data.texture)}"
   crs:Clarity2012="${Math.round(data.clarity)}"
   crs:Dehaze="${Math.round(data.dehaze)}"

   crs:GrainAmount="${Math.round(data.grain.amount)}"
   crs:GrainSize="${Math.round(data.grain.size)}"
   crs:GrainFrequency="${Math.round(data.grain.roughness)}"
   crs:GrainSeed="${Math.floor(Math.random() * 1000000) + 1}"
   
   crs:PostCropVignetteAmount="${Math.round(data.vignetteAmount)}"
   crs:PostCropVignetteMidpoint="${Math.round(data.vignetteMidpoint)}"
   crs:PostCropVignetteRoundness="${Math.round(data.vignetteRoundness)}"
   crs:PostCropVignetteFeather="${Math.round(data.vignetteFeather)}"
   crs:PostCropVignetteHighlightContrast="${Math.round(data.vignetteHighlights)}"
   
   crs:LuminanceSmoothing="${Math.round(data.noiseReduction)}"
   crs:LuminanceNoiseReductionDetail="${Math.round(data.noiseDetail)}"
   crs:LuminanceNoiseReductionContrast="${Math.round(data.noiseContrast)}"
   crs:ColorNoiseReduction="${Math.round(data.colorNoiseReduction)}"

   crs:Sharpness="${Math.round(data.sharpening.amount)}"
   crs:SharpenRadius="${data.sharpening.radius.toFixed(1)}"
   crs:SharpenDetail="${Math.round(data.sharpening.detail)}"
   crs:SharpenEdgeMasking="${Math.round(data.sharpening.masking)}"
   
   crs:ParametricShadows="${Math.round(data.parametricShadows)}"
   crs:ParametricDarks="${Math.round(data.parametricDarks)}"
   crs:ParametricLights="${Math.round(data.parametricLights)}"
   crs:ParametricHighlights="${Math.round(data.parametricHighlights)}"
   crs:ParametricShadowSplit="25"
   crs:ParametricMidtoneSplit="50"
   crs:ParametricHighlightSplit="75"

   crs:ToneCurveName2012="Custom"
   crs:HasSettings="True">
   <crs:Name>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${presetName}</rdf:li>
    </rdf:Alt>
   </crs:Name>
   <crs:ShortName>
    <rdf:Alt>
     <rdf:li xml:lang="x-default"/>
    </rdf:Alt>
   </crs:ShortName>
   <crs:SortName>
    <rdf:Alt>
     <rdf:li xml:lang="x-default"/>
    </rdf:Alt>
   </crs:SortName>
   <crs:Group>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">Web Generated</rdf:li>
    </rdf:Alt>
   </crs:Group>
   <crs:ToneCurvePV2012>
    <rdf:Seq>
${buildCurvePoints(data.advanced.rgbCurve)}
    </rdf:Seq>
   </crs:ToneCurvePV2012>
   <crs:ToneCurvePV2012Red>
    <rdf:Seq>
${buildCurvePoints(data.advanced.redCurve)}
    </rdf:Seq>
   </crs:ToneCurvePV2012Red>
   <crs:ToneCurvePV2012Green>
    <rdf:Seq>
${buildCurvePoints(data.advanced.greenCurve)}
    </rdf:Seq>
   </crs:ToneCurvePV2012Green>
   <crs:ToneCurvePV2012Blue>
    <rdf:Seq>
${buildCurvePoints(data.advanced.blueCurve)}
    </rdf:Seq>
   </crs:ToneCurvePV2012Blue>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  return xmpString;
};

export const downloadPreset = (xmpString: string, filename: string = "preset.xmp") => {
  const blob = new Blob([xmpString], { type: "application/rdf+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
