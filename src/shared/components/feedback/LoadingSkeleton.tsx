import React from 'react';
import { View, StyleSheet, ViewStyle } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';

interface LoadingSkeletonProps {
  style?: ViewStyle;
  variant?: 'text' | 'rect' | 'circle';
  width?: number | string;
  height?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  style,
  variant = 'rect',
  width = '100%',
  height = 20,
}) => {
  const { colors } = useTheme();

  const getStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.divider,
      width: typeof width === 'number' ? width : (width as any),
      height,
    };

    if (variant === 'text') {
      base.borderRadius = 4;
      base.height = height || 12;
    } else if (variant === 'circle') {
      base.borderRadius = typeof width === 'number' ? width / 2 : 9999;
      base.height = typeof width === 'number' ? width : 40;
    } else {
      base.borderRadius = 6;
    }

    return base;
  };

  return <View style={[getStyle(), style]} />;
};

export default LoadingSkeleton;
