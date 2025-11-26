import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';

interface OfflineBannerProps {
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ 
  message = "Sem conexão com a internet. Alguns recursos podem estar limitados." 
}) => {
  const paperTheme = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
      <Ionicons name="cloud-offline-outline" size={ICON_SIZES.md} color={paperTheme.colors.onSurfaceVariant} />
      <Text style={[styles.text, { color: paperTheme.colors.onSurfaceVariant }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  text: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
});

