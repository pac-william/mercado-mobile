import { useState, useEffect, useMemo } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ResponsiveDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

interface ResponsiveBreakpoints {
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;
  isPhone: boolean;
}

interface UseResponsiveReturn extends ResponsiveDimensions, ResponsiveBreakpoints {
  wp: (percentage: number) => number;
  hp: (percentage: number) => number;
  getWidth: (percentage: number) => number;
  getHeight: (percentage: number) => number;
}

const BREAKPOINTS = {
  small: 360,
  medium: 768,
  large: 1024,
  tablet: 768,
};

export const useResponsive = (): UseResponsiveReturn => {
  const [dimensions, setDimensions] = useState<ResponsiveDimensions>(() => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    return { width, height, scale, fontScale };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
      });
    });

    return () => subscription?.remove();
  }, []);

  const breakpoints = useMemo<ResponsiveBreakpoints>(() => {
    const { width } = dimensions;
    return {
      isSmall: width < BREAKPOINTS.small,
      isMedium: width >= BREAKPOINTS.small && width < BREAKPOINTS.medium,
      isLarge: width >= BREAKPOINTS.large,
      isTablet: width >= BREAKPOINTS.tablet,
      isPhone: width < BREAKPOINTS.tablet,
    };
  }, [dimensions.width]);

  const wp = useMemo(() => {
    return (percentage: number): number => {
      return (dimensions.width * percentage) / 100;
    };
  }, [dimensions.width]);

  const hp = useMemo(() => {
    return (percentage: number): number => {
      return (dimensions.height * percentage) / 100;
    };
  }, [dimensions.height]);

  const getWidth = useMemo(() => {
    return (percentage: number): number => {
      return dimensions.width * (percentage / 100);
    };
  }, [dimensions.width]);

  const getHeight = useMemo(() => {
    return (percentage: number): number => {
      return dimensions.height * (percentage / 100);
    };
  }, [dimensions.height]);

  return {
    ...dimensions,
    ...breakpoints,
    wp,
    hp,
    getWidth,
    getHeight,
  };
};

