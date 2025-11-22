/**
 * Convert Cartesian (x,y) to polar (r,theta).
 * @param {number} x
 * @param {number} y
 * @returns {[number, number]} [r, theta] where r >= 0, theta in radians
 */
function toPolar2D(x, y) {
  const r = Math.sqrt(x * x + y * y);
  const theta = Math.atan2(y, x);
  return [r, theta];
}

/**
 * Convert polar (r,theta) to Cartesian (x,y).
 * @param {number} r
 * @param {number} theta - angle in radians
 * @returns {[number, number]} [x, y]
 */
function fromPolar2D(r, theta) {
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  return [x, y];
}

/**
 * Euclidean distance between two Cartesian points.
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @returns {number}
 */
function distance2D(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Smallest angular distance between two angles (in radians).
 * Result is in [0, π].
 * @param {number} theta1
 * @param {number} theta2
 * @returns {number}
 */
function angularDistance(theta1, theta2) {
  let diff = Math.abs(theta1 - theta2) % (2 * Math.PI);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;
  return diff;
}

/**
 * Dot product of two vectors.
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @returns {number}
 */
function dot2D(ax, ay, bx, by) {
  return ax * bx + ay * by;
}

/**
 * Normalize a vector to unit length.
 * @param {number} x
 * @param {number} y
 * @returns {[number, number]}
 */
function normalize2D(x, y) {
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return [0, 0];
  return [x / len, y / len];
}

/**
 * Angle between two vectors (in radians).
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @returns {number}
 */
function angleBetween2D(ax, ay, bx, by) {
  const dot = dot2D(ax, ay, bx, by);
  const magA = Math.sqrt(ax * ax + ay * ay);
  const magB = Math.sqrt(bx * bx + by * by);
  if (magA === 0 || magB === 0) return 0;
  const cosTheta = dot / (magA * magB);
  return Math.acos(Math.min(1, Math.max(-1, cosTheta)));
}

export const vectors = {
  toPolar2D,
  fromPolar2D,
  distance2D,
  angularDistance,
  dot2D,
  normalize2D,
  angleBetween2D,
};
