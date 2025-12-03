export const isValidImageUri = (uri: string | null | undefined): boolean => {
  if (!uri) return false;
  if (uri.startsWith('blob:')) return false;
  if (uri.startsWith('data:image/')) return true;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return true;
  if (uri.startsWith('file://')) return true;
  return false;
};

export const getCachedImageUrl = (baseUrl: string, timestamp?: number): string => {
  if (!baseUrl || baseUrl.startsWith('data:') || baseUrl.startsWith('file://')) {
    return baseUrl;
  }
  const ts = timestamp || Date.now();
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}t=${ts}`;
};

