/** Format a Challenge Rating, using fractions below 1 as the SRD does. */
export function formatCr(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

export function formatXp(xp: number): string {
  return xp.toLocaleString('en-US');
}
