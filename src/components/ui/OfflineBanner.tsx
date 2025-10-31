import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface OfflineBannerProps {
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ 
  message = "Sem conexão com a internet. Alguns recursos podem estar limitados." 
}) => {
  const paperTheme = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
      <Ionicons name="cloud-offline-outline" size={18} color={paperTheme.colors.onSurfaceVariant} />
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  text: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
});

