import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { FONT_SIZE, ICON_SIZES, SPACING } from '../../constants/styles';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  rightComponent?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  icon,
  iconColor,
  rightComponent,
}) => {
  const navigation = useNavigation();
  const paperTheme = useCustomTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const defaultIconColor = iconColor || paperTheme.colors.primary;

  return (
    <View style={[styles.header, { borderBottomColor: paperTheme.colors.borderLight }]}>
      {showBackButton && (
        <TouchableOpacity 
          onPress={handleBackPress} 
          style={styles.backButton}
          hitSlop={{ top: SPACING.sm, bottom: SPACING.sm, left: SPACING.sm, right: SPACING.sm }}
        >
          <Ionicons
            name="chevron-back"
            size={ICON_SIZES.xl}
            color={paperTheme.colors.onSurface}
          />
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer}>
        {icon && (
          <Ionicons
            name={icon}
            size={ICON_SIZES.xlPlus}
            color={defaultIconColor}
            style={styles.icon}
          />
        )}
        <Text 
          style={[styles.title, { color: paperTheme.colors.onSurface }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
      {rightComponent && <View style={styles.rightContainer}>{rightComponent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    flex: 1,
    flexShrink: 1,
  },
  rightContainer: {
    marginLeft: SPACING.md,
    flexShrink: 0,
  },
});

