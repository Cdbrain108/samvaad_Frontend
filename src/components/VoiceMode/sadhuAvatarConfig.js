/**
 * Samvaad Sadhu Avatar — tuning template
 * -----------------------------------------
 * Edit the values below to reshape/recolor the 3D avatar without touching
 * the Three.js rendering code in SadhuAvatar3D.jsx.
 *
 * Colors are hex numbers (0xRRGGBB). Positions/sizes are in "avatar units"
 * (roughly meters at this camera distance — head radius is ~0.42 units).
 */

export const AVATAR_COLORS = {
  robe: 0xe0762f,          // Main outer robe cloth
  seat: 0xb4560a,          // Small disc the figure sits on
  skin: 0xc98a5b,          // Face/neck/hand tone
  hairBun: 0x4a3a2c,       // Top-knot (jata)
  beard: 0xd8d2c6,         // Beard/mustache
  eyes: 0x231a12,          // Eye color
  mouth: 0x5c2a1c,         // Mouth line/opening color
  mala: 0x5b4636,          // Rosary bead color
  tilakStripe: 0xffb300,   // Forehead stripe (saffron/gold)
  tilakDot: 0xc8401f,      // Forehead dot (deep red/orange)
  haloRing: 0xffc84b,      // Halo ring base color
  haloGlow: 0xffb300,      // Halo emissive glow color
  lightKey: 0xffd7a8,      // Main warm key light
  lightRim: 0xfff3df,      // Soft rim/back light
  lightAmbient: 0xffe9cf,  // Ambient fill light
};

export const AVATAR_PROPORTIONS = {
  headRadius: 0.4,
  headY: 2.36,                 // Head center height, sits atop the neck
  robeNeckOpeningRadius: 0.17, // Radius left open at the top of the robe for the neck
  neckTopRadius: 0.16,
  neckBottomRadius: 0.22,
  neckHeight: 0.24,
  neckY: 2.06,                 // Neck cylinder center height

  bunRadius: 0.17,
  bunScale: [1, 1.05, 1],       // Top-knot squash/stretch [x, y, z]
  bunPosition: [0, 0.56, -0.02],

  beardSize: [0.19, 0.82],      // [radius, height] of the beard cone — narrow & long, not wide
  beardPosition: [0, -0.5, 0.2],

  eyeRadius: 0.045,
  eyeSpacing: 0.15,             // Distance of each eye from center
  eyePosition: [0.06, 0.36],    // [y, z] shared by both eyes

  mouthSmileRadius: 0.1,        // Resting closed-mouth smile arc
  mouthSmileTube: 0.014,
  mouthSmilePosition: [0, -0.12, 0.36],
  mouthOpenPosition: [0, -0.13, 0.37],
  mouthOpenBaseScale: 0.001,    // Nearly invisible when not speaking

  handRadius: 0.115,
  handOffsetX: 0.24,            // Distance of each hand from center
  handPosition: [0.86, 0.6],    // [y, z] shared by both hands (in body space)

  malaBeadCount: 22,
  malaRadius: 0.34,

  haloRadius: 0.54,
  haloTubeThickness: 0.02,
  haloPosition: [0, 0.1, -0.18],

  cameraDistance: 6.3,
  cameraHeight: 1.7,
  cameraLookAtY: 1.28,          // Vertical center point the camera aims at
};

export const AVATAR_MOTION = {
  idleBobSpeed: 1.1,
  idleBobAmount: 0.02,
  thinkingBobSpeed: 2.1,
  headSwaySpeed: 0.6,
  headSwayAmount: 0.04,       // Radians; thinking uses roughly double this
  blinkMinDelay: 2.6,         // Seconds between blinks (minimum)
  blinkMaxDelay: 5.8,         // Seconds between blinks (maximum)
  blinkDuration: 0.12,
  talkFrequency: 9,           // How fast the mouth oscillates while speaking
  talkBaseAmount: 0.62,
  talkPulseAmount: 0.5,       // Extra "punch" applied on each speech tick
  haloPulseSpeed: 6,
  haloIdleIntensity: 0.45,
  haloThinkingIntensity: 0.7,
  haloSpeakingIntensity: 0.85,
};
