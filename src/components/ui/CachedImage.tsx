import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { Image as ExpoImage, ImageSource, ImageContentFit } from 'expo-image';
import { isValidImageUri } from '../../utils/imageUtils';

interface CachedImageProps {
  source: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center' | 'repeat';
  cachePolicy?: 'memory' | 'disk' | 'memory-disk' | 'none';
  priority?: 'low' | 'normal' | 'high';
  onError?: () => void;
  onLoad?: () => void;
  placeholder?: ImageSource;
  contentFit?: ImageContentFit;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  cachePolicy = 'memory-disk',
  priority = 'normal',
  onError,
  onLoad,
  placeholder,
  contentFit,
}) => {
  if (!source || !isValidImageUri(source)) {
    return null;
  }

  if (source.startsWith('data:image/') || source.startsWith('file://')) {
    return (
      <Image
        source={{ uri: source }}
        style={style as StyleProp<ImageStyle>}
        resizeMode={resizeMode}
        onError={onError}
        onLoad={onLoad}
      />
    );
  }

  const cachePolicyMap: Record<string, 'memory' | 'disk' | 'memory-disk' | 'none'> = {
    'memory': 'memory',
    'disk': 'disk',
    'memory-disk': 'memory-disk',
    'none': 'none',
  };

  const contentFitMap: Record<string, ImageContentFit> = {
    'contain': 'contain',
    'cover': 'cover',
    'stretch': 'fill',
    'center': 'none',
    'repeat': 'cover',
  };

  return (
    <ExpoImage
      source={{ uri: source }}
      style={style}
      contentFit={contentFit || contentFitMap[resizeMode] || 'cover'}
      cachePolicy={cachePolicyMap[cachePolicy] || 'memory-disk'}
      priority={priority}
      onError={onError}
      onLoad={onLoad}
      placeholder={placeholder}
      transition={200}
    />
  );
};

