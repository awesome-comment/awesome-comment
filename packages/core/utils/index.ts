export function sleep(duration: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function isMac(): boolean {
  return !!navigator.userAgent.match(/Macintosh/);
}

export function withCommandModifier(event: KeyboardEvent, key: string)  {
  const _isMac = isMac();
  return (_isMac ? event.metaKey : event.ctrlKey) && event.key === key;
}

export function clickWithModifier(event?: MouseEvent): boolean {
  if (!event) return false;

  const _isMac = isMac();
  return (_isMac ? event.metaKey : event.ctrlKey) && event.button === 0;
}
