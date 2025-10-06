export function checkShouldTranslate(item: string): boolean {
  const trimmed = item.trim();
  if (!trimmed) return false;

  // Remove punctuation, numbers, and whitespace
  const removed = item
    .replace(/\p{P}/gu, '')
    .replace(/\d+(?:[.,]\d+)*/g, '')
    .trim();
  
  if (!removed) return false;

  // Check if the content is only emojis (and possibly whitespace)
  // Emojis are in various Unicode ranges, we'll check if removing emoji leaves empty string
  const withoutEmojis = removed.replace(/[\p{Emoji}\p{Emoji_Component}\p{Emoji_Modifier}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]/gu, '').trim();
  
  // If after removing emojis there's nothing left, it's emoji-only
  if (!withoutEmojis) return false;

  return true;
}
