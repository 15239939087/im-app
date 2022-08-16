/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 *
 * @param min
 * @param max
 * @param data
 * @returns
 */
export const getRealValue = (min: number, max: number, data: number) => {
  if (data > max) return max;
  if (data < min) return min;
  return data;
};
/**
 *
 * @param radian
 * @param radius
 * @param outerRadius
 * @returns
 */
export const getPoint = (radian: number, radius: number, outerRadius: number) => {
  const x = outerRadius - radius * Math.sin(radian);
  const y = outerRadius - radius * Math.cos(radian);
  return { x, y };
};
/**
 *
 * @param x
 * @param y
 * @param outerRadius
 * @returns
 */
export const getCurrentAngle = (x: number, y: number, outerRadius: number) => {
  const sinX = outerRadius - x;
  const cosY = outerRadius - y;
  let atanAngle = Math.atan(sinX / cosY);

  if (atanAngle > 0) {
    // 大于 180 度
    if (sinX > 0) {
      atanAngle -= 2 * Math.PI;
    } else {
      atanAngle -= Math.PI;
    }
  } else if (sinX > 0) {
    atanAngle -= Math.PI;
  }
  return (atanAngle * 180) / Math.PI;
};
/**
 *
 * @param value
 * @param min
 * @param max
 * @param terminalAngle
 * @returns
 */
export const getTargetAngle = (value: number, min: number, max: number, terminalAngle: number) => {
  const targetTemp = value;
  const targetAngle = ((targetTemp - min) * terminalAngle) / (max - min);
  return targetAngle;
};
/**
 *
 * @param value
 * @param min
 * @param max
 * @param terminalAngle
 * @param pointerRadius
 * @param outerRadius
 * @returns
 */
export const getPointerPosition = (
  value: number,
  min: number,
  max: number,
  terminalAngle: number,
  pointerRadius: number,
  outerRadius: number
) => {
  const targetAngle = getTargetAngle(value, min, max, terminalAngle) || 0;

  const targetRadian = (targetAngle * Math.PI) / 180;
  const { x, y } = getPoint(targetRadian, pointerRadius, outerRadius);
  const transform = -targetAngle;
  const pointerWidth = 13;
  const pinterHeight = 12;
  return { x: x - pinterHeight / 2, y: y - pointerWidth / 2, transform };
};
/**
 *
 * @param targetAngle
 * @param radius
 * @param terminalAngle
 * @param outerRadius
 * @returns
 */
export const getActiveSliderPath = (
  targetAngle: number,
  radius: number,
  terminalAngle: number,
  outerRadius: number
) => {
  if (targetAngle < terminalAngle) return;
  const targetRadian = (targetAngle * Math.PI) / 180;
  // startPoint
  const { x: x1, y: y1 } = getPoint(0, radius, outerRadius);
  const { x: x2, y: y2 } = getPoint((terminalAngle * Math.PI) / (180 * 2), radius, outerRadius);
  if (targetRadian > -Math.PI) {
    // 小角度
    const { x: x3, y: y3 } = getPoint(targetRadian, radius, outerRadius);
    return `M${x1} ${y1} A ${radius} ${radius}, 0, 0, 1, ${x3} ${y3}`;
  }
  if (targetRadian < -Math.PI) {
    // 大角度
    const { x: x3, y: y3 } = getPoint(targetRadian, radius, outerRadius);
    return `M${x1} ${y1} A ${radius} ${radius}, 0, 0, 1, ${x2} ${y2} A ${radius} ${radius}, 0, 0, 1, ${x3} ${y3}`;
  }
  // 一半角度
  const { x: x3, y: y3 } = getPoint(targetRadian, radius, outerRadius);
  // eslint-disable-next-line max-len
  return `M${x1} ${y1} A ${radius} ${radius}, 0, 0, 1, ${x2} ${y2} A ${radius} ${radius}, 0, 0, 1, ${x3} ${y3}`;
};
/**
 *
 * @param _angle
 * @param trackRadius
 * @param outerRadius
 * @returns
 */
export const getCurrentPoint = (_angle: number, trackRadius: number, outerRadius: number) => {
  const point = getPoint(_angle, trackRadius, outerRadius);
  return point;
};
/**
 *
 * @param x
 * @param y
 * @param trackRadius
 * @param outerRadius
 * @param responseWidth
 * @returns
 */
export const calcIsRange = (
  x: number,
  y: number,
  trackRadius: number,
  outerRadius: number,
  responseWidth: number
) => {
  const currentAngle = getCurrentAngle(x, y, outerRadius);
  const currentRadian = (currentAngle * Math.PI) / 180;
  const { x: targetX, y: targetY } = getCurrentPoint(currentRadian, trackRadius, outerRadius);
  // 算外圆与内圆之间的间距
  const offsetX = Math.pow(x - targetX, 2);
  const offsetY = Math.pow(y - targetY, 2);
  const distance = Math.pow(offsetX + offsetY, 0.5);
  return distance <= responseWidth;
};
/**
 *
 * @param _angle
 * @param radius
 * @param outerRadius
 * @param terminalAngle
 * @returns
 */
export const getSliderPath = (
  _angle: number,
  radius: number,
  outerRadius: number,
  terminalAngle: number
) => {
  const radian = (_angle * Math.PI) / 180;
  const p1 = getPoint(radian, radius, outerRadius);
  const p2 = getPoint(radian - Math.PI / 2, radius, outerRadius);
  const p3 = getPoint((terminalAngle * Math.PI) / 180, radius, outerRadius);
  return `M${p1.x} ${p1.y} A ${radius} ${radius}, 0, 0, 1, ${p2.x} ${p2.y} A ${radius} ${radius}, 0, 1, 1, ${p3.x} ${p3.y}`;
};
/**
 *
 * @param _angle
 * @param innerScaleRadius
 * @param outerScaleRadius
 * @param outerRadius
 * @returns
 */
export const getMarkerScalePath = (
  _angle: number,
  innerScaleRadius: number,
  outerScaleRadius: number,
  outerRadius: number
) => {
  const radian = (_angle * Math.PI) / 180;
  // startPoint
  const { x: x1, y: y1 } = getPoint(radian, innerScaleRadius, outerRadius);
  // endPoint
  const { x: x2, y: y2 } = getPoint(radian, outerScaleRadius, outerRadius);
  return `M${x1} ${y1} L${x2} ${y2}`;
};
