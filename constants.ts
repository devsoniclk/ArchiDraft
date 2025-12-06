import { DrawingStyle } from './types';
import React from 'react';

export const STYLE_DESCRIPTIONS: Record<DrawingStyle, string> = {
  [DrawingStyle.BLUEPRINT]: "Classic white-on-blue architectural blueprint with grid lines and measurements.",
  [DrawingStyle.PENCIL_SKETCH]: "Artistic graphite pencil sketch with shading and rough edges.",
  [DrawingStyle.TECHNICAL_LINE]: "Clean, precise black and white line art suitable for technical documentation.",
  [DrawingStyle.INK_WASH]: "Traditional ink wash rendering showing lighting and depth.",
  [DrawingStyle.WIREFRAME]: "Digital 3D wireframe representation focusing on structural geometry."
};

export const SAMPLE_IMAGES = [
  "https://picsum.photos/800/600",
  "https://picsum.photos/800/601",
  "https://picsum.photos/800/602"
];
