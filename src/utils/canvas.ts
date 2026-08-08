import { Point, Stroke } from '../types';

export function screenToCanvas(
  screenX: number,
  screenY: number,
  offset: Point,
  scale: number
): Point {
  return {
    x: (screenX - offset.x) / scale,
    y: (screenY - offset.y) / scale,
  };
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  offset: Point,
  scale: number
): Point {
  return {
    x: canvasX * scale + offset.x,
    y: canvasY * scale + offset.y,
  };
}

/**
 * Check if a point is close to a stroke line segment for eraser tool
 */
export function isPointNearStroke(
  point: Point,
  stroke: Stroke,
  threshold: number = 10
): boolean {
  if (!stroke.points || stroke.points.length === 0) return false;

  const thresholdSq = threshold * threshold;

  if (stroke.points.length === 1) {
    const dx = point.x - stroke.points[0].x;
    const dy = point.y - stroke.points[0].y;
    return dx * dx + dy * dy <= thresholdSq;
  }

  for (let i = 0; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i];
    const p2 = stroke.points[i + 1];

    const distSq = distToSegmentSq(point, p1, p2);
    if (distSq <= thresholdSq) return true;
  }

  return false;
}

function distToSegmentSq(p: Point, v: Point, w: Point): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;

  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = v.x + t * (w.x - v.x);
  const projY = v.y + t * (w.y - v.y);

  return (p.x - projX) ** 2 + (p.y - projY) ** 2;
}

/**
 * Generate smooth SVG path string from points array
 */
export function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  if (points.length === 2) {
    return `${d} L ${points[1].x} ${points[1].y}`;
  }

  // Smooth quadratic curves through midpoints
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }

  // Last point
  d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

  return d;
}
