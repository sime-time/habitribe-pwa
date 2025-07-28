export function divide(numerator: number, denominator: number) {
  if (denominator === 0) {
    console.error("Cannot divide by zero")
    return 0;
  }

  const result = numerator / denominator;
  return Math.round(result);
}
