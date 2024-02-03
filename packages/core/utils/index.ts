export function sleep(duration: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function isMac() {
  return navigator.userAgent.match(/Macintosh/);
}

export function withCommandModifier(event: KeyboardEvent, key: string)  {
  const _isMac = isMac();
  return (_isMac && event.metaKey || !_isMac && event.ctrlKey) && event.key === key;
}
