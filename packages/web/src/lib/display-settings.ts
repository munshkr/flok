export interface DisplaySettings {
  canvasPixelSize: number;
  showCanvas: boolean;
  enableFft: boolean;
}

export const defaultDisplaySettings: DisplaySettings = {
  canvasPixelSize: 1,
  showCanvas: true,
  enableFft: true,
};

export function sanitizeDisplaySettings(
  settings: DisplaySettings,
): DisplaySettings {
  // Pixel size should be at least 1 to prevent division-by-zero errors
  const minPixelSize = 1;

  // A maximum pixel size of 50 gives you 2-digit width/heights for a 4k
  // canvas; should be low enough
  const maxPixelSize = 50;

  return {
    ...settings,
    canvasPixelSize: Math.max(
      minPixelSize,
      Math.min(maxPixelSize, Math.round(settings.canvasPixelSize)),
    ),
  };
}
