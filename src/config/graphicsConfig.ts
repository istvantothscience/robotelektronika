export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GraphicsConfig {
  quality: GraphicsQuality;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  maxPixelRatio: number;
  particlesEnabled: boolean;
  postProcessingEnabled: boolean;
  atmosphericEffectsEnabled: boolean;
}

export const GRAPHICS_PRESETS: Record<GraphicsQuality, GraphicsConfig> = {
  low: {
    quality: 'low',
    shadowsEnabled: false,
    shadowMapSize: 512,
    maxPixelRatio: 1.0,
    particlesEnabled: false,
    postProcessingEnabled: false,
    atmosphericEffectsEnabled: false,
  },
  medium: {
    quality: 'medium',
    shadowsEnabled: true,
    shadowMapSize: 1024,
    maxPixelRatio: 1.25,
    particlesEnabled: true,
    postProcessingEnabled: false,
    atmosphericEffectsEnabled: true,
  },
  high: {
    quality: 'high',
    shadowsEnabled: true,
    shadowMapSize: 1024,
    maxPixelRatio: 1.5,
    particlesEnabled: true,
    postProcessingEnabled: true,
    atmosphericEffectsEnabled: true,
  },
};
