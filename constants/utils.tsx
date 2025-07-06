export function formatTime(
  elapsedTime: number,
  millisecondsFormat: "." | ":",
): string {
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  const seconds = Math.floor((elapsedTime / 1000) % 60);
  const milliseconds = Math.floor((elapsedTime % 1000) / 10);

  const stringifiedHours = String(hours).padStart(2, "0");
  const stringifiedMinutes = String(minutes).padStart(2, "0");
  const stringifiedSeconds = String(seconds).padStart(2, "0");
  const stringifiedMilliseconds = String(milliseconds).padStart(2, "0");

  return hours
    ? `${stringifiedHours}:${stringifiedMinutes}:${stringifiedSeconds}${millisecondsFormat}${stringifiedMilliseconds}`
    : minutes
    ? `${stringifiedMinutes}:${stringifiedSeconds}${millisecondsFormat}${stringifiedMilliseconds}`
    : `${stringifiedSeconds}${millisecondsFormat}${stringifiedMilliseconds}`;
}
