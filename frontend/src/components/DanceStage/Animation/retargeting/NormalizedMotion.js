/**
 * NormalizedMotion represents a generalized skeleton animation format.
 * 
 * Schema:
 * {
 *   skeleton: { name: 'normalized-humanoid', joints: ['root', 'spine', 'leftArm', ...] },
 *   duration: Number (seconds),
 *   fps: Number,
 *   frames: [
 *     {
 *       time: Number (seconds),
 *       rootPosition: [x, y, z], // Global translation of the root node
 *       joints: {
 *         // Rotations are represented as Quaternions: [x, y, z, w]
 *         root: [x, y, z, w],
 *         spine: [x, y, z, w],
 *         leftArm: [x, y, z, w],
 *         ...
 *       }
 *     }
 *   ]
 * }
 */
export const createEmptyMotion = (duration, fps) => {
  return {
    skeleton: {
      name: 'normalized-humanoid',
      joints: []
    },
    duration,
    fps,
    frames: []
  };
};
