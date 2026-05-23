export function getGuessPoints(guessPosition: number): number {
  if (guessPosition === 1) return 7;
  if (guessPosition === 2) return 5;
  if (guessPosition === 3) return 3;
  return 1;
}

export const DRAWER_POINTS = 5;