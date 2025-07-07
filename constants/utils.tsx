export function formatTime(
  elapsedTime: number,
  millisecondsFormat: "." | ":",
  padStart: boolean,
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
    ? `${
        padStart ? stringifiedHours : String(hours)
      }:${stringifiedMinutes}:${stringifiedSeconds}${millisecondsFormat}${stringifiedMilliseconds}`
    : minutes
    ? `${
        padStart ? stringifiedMinutes : String(minutes)
      }:${stringifiedSeconds}${millisecondsFormat}${stringifiedMilliseconds}`
    : `${
        padStart ? String(seconds).padStart(1, "0") : String(seconds)
      }${millisecondsFormat}${stringifiedMilliseconds}`;
}
