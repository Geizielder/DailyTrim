export function addSeconds(base: number, extra: number): number {
  const result = base + extra;
  return result < 0 ? 0 : result;
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
