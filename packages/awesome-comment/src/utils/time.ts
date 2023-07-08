export function toTen(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}
export function getDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${toTen(month)}-${toTen(day)}`;
}
export function formatTime(date: Date): string {
  const today = new Date();
  const dateStr = getDate(date);
  if (getDate(today) === dateStr) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${toTen(hour)}:${toTen(minute)}`;
  }

  return dateStr;
}
