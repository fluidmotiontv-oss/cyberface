import { MacroSequence } from '../types';

export const DEFAULT_MACRO_PRESETS: MacroSequence[] = [
  {
    id: 'macro-preset-awakening',
    name: 'Dragon Awakening Protocol',
    description: 'Sequenced activation: Wing Stretch -> Horn Lightning Charge -> Roar Salute Beam',
    isPreset: true,
    isLooping: false,
    steps: [
      { id: 'step-1', gestureId: 'wing_stretch', delayMs: 600 },
      { id: 'step-2', gestureId: 'horn_charge', delayMs: 800 },
      { id: 'step-3', gestureId: 'roar_salute', delayMs: 500 },
      { id: 'step-4', gestureId: 'sonic_flare', delayMs: 1000 },
    ],
  },
  {
    id: 'macro-preset-aerial-combo',
    name: 'Aerial Acrobatics Combo',
    description: 'High kinetic maneuvering: 360° Barrel Roll -> Tail Whip & Arc -> Sonic Flare Burst',
    isPreset: true,
    isLooping: false,
    steps: [
      { id: 'step-1', gestureId: 'barrel_roll', delayMs: 400 },
      { id: 'step-2', gestureId: 'tail_whip', delayMs: 500 },
      { id: 'step-3', gestureId: 'sonic_flare', delayMs: 600 },
    ],
  },
  {
    id: 'macro-preset-stealth-salute',
    name: 'Stealth Honor Sequence',
    description: 'Formal protocol: Cybernetic Bow -> Stealth Matrix Cloak -> Wing Stretch',
    isPreset: true,
    isLooping: false,
    steps: [
      { id: 'step-1', gestureId: 'cyber_bow', delayMs: 800 },
      { id: 'step-2', gestureId: 'stealth_cloak', delayMs: 1000 },
      { id: 'step-3', gestureId: 'wing_stretch', delayMs: 500 },
    ],
  },
  {
    id: 'macro-preset-stream-hype',
    name: 'Stream Celebration Hype',
    description: 'Maximum visual impact sequence: Roar Salute -> Horn Lightning -> Barrel Roll -> Sonic Flare',
    isPreset: true,
    isLooping: false,
    steps: [
      { id: 'step-1', gestureId: 'roar_salute', delayMs: 500 },
      { id: 'step-2', gestureId: 'horn_charge', delayMs: 600 },
      { id: 'step-3', gestureId: 'barrel_roll', delayMs: 400 },
      { id: 'step-4', gestureId: 'sonic_flare', delayMs: 800 },
    ],
  },
];
