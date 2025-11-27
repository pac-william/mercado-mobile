import { Platform } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { SPACING } from '../constants/styles';

export const getTabBarHeight = (insets: EdgeInsets): number => {
  const baseHeight = Platform.OS === 'ios' ? 70 : 56;
  const bottomInset = Math.max(insets.bottom - (Platform.OS === 'ios' ? 25 : 0), 0);
  return baseHeight + bottomInset;
};

export const getTabBarPaddingBottom = (insets: EdgeInsets): number => {
  return Math.max(insets.bottom - (Platform.OS === 'ios' ? 25 : 0), Platform.OS === 'ios' ? 2 : 8);
};

export const getScreenBottomPadding = (insets: EdgeInsets): number => {
  const tabBarHeight = getTabBarHeight(insets);
  const extraSpacing = SPACING.xl + SPACING.md;
  return tabBarHeight + extraSpacing;
};

