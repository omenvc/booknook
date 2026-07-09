const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

export function delay(): Promise<void> {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function shouldFail(simulateFailure: boolean | undefined, failureRate: number): boolean {
  if (simulateFailure !== undefined) {
    return simulateFailure;
  }
  return Math.random() < failureRate;
}
