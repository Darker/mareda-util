
/**
 * 
 * @param {number} degrees 0-360
 */
function deg2rad(degrees) {
    return (degrees * Math.PI) / 180;
}

/**
 * 
 * @param {number} radians 0-2*pi
 */
function rad2deg(radians) {
    return (radians / Math.PI) * 180;
}

/**
 * Smallest angular distance between two angles (in radians).
 * Result is in [0, π].
 * @param {number} theta1
 * @param {number} theta2
 * @returns {number}
 */
function angularDistanceRad(theta1, theta2) {
  let diff = Math.abs(theta1 - theta2) % (2 * Math.PI);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;
  return diff;
}

export const angles = {
    rad2deg,
    deg2rad,
    angularDistanceRad
}