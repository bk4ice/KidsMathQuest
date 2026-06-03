export function normalizeDecimalAnswer(value: string | number, decimalPlaces: number): string {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return '';
  }

  return numericValue.toFixed(decimalPlaces);
}

export function compareAnswers(userAnswer: string, correctAnswer: string, decimalPlaces?: number | null): boolean {
  if (decimalPlaces == null) {
    return userAnswer.trim() === correctAnswer.trim();
  }

  return normalizeDecimalAnswer(userAnswer, decimalPlaces) === normalizeDecimalAnswer(correctAnswer, decimalPlaces);
}

export function randomDecimalInRange(min: number, max: number, decimalPlaces: number): string {
  const scale = Math.pow(10, decimalPlaces);
  const minSeed = Math.round(min * scale);
  const maxSeed = Math.round(max * scale);

  if (maxSeed < minSeed) {
    return normalizeDecimalAnswer(min, decimalPlaces);
  }

  const seed = Math.floor(Math.random() * (maxSeed - minSeed + 1)) + minSeed;
  return normalizeDecimalAnswer(seed / scale, decimalPlaces);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
