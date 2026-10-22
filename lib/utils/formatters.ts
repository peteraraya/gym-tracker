export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function parseTime(input: string): number | null {
  // Acepta "1:30", "90", "1m30s", "90s"
  const match = input.match(/^(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (match) {
    const mins = parseInt(match[1] || '0', 10);
    const secs = parseInt(match[2] || '0', 10);
    return mins * 60 + secs;
  }
  const colonMatch = input.match(/^(\d+):(\d{2})$/);
  if (colonMatch) {
    return parseInt(colonMatch[1], 10) * 60 + parseInt(colonMatch[2], 10);
  }
  const justSeconds = parseInt(input, 10);
  if (!isNaN(justSeconds)) return justSeconds;
  return null;
}