export function checkShouldTranslate(item: string): boolean {
  const trimmed = item.trim();
  if (!trimmed) return false;

  const removed = item
    .replace(/\p{P}/gu, '')
    .replace(/\d+(?:[.,]\d+)*/g, '')
    .trim();
  return !!removed;
}
