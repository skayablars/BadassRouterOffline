
export function angleToRadian(angle) {
  return (angle * Math.PI) / 180;
}

export function randomAngle(angles) {
  return angleToRadian(engine.randomInt(0, angles.length));
}
 