import React, { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ViewStyle = Record<string, any>;
export type TextStyle = Record<string, any>;
export type StyleProp<T> = T | Array<StyleProp<T>> | false | null | undefined;

export interface TextInputProps {
  [key: string]: any;
  style?: StyleProp<TextStyle>;
  onChangeText?: (value: string) => void;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

const UNITLESS = new Set([
  'aspectRatio', 'flex', 'flexGrow', 'flexShrink', 'fontWeight', 'opacity', 'order', 'zIndex',
]);

const flatten = (style: StyleProp<any>): Record<string, any> => {
  if (!style) return {};
  if (Array.isArray(style)) return style.reduce((acc, item) => ({ ...acc, ...flatten(item) }), {});
  return { ...style };
};

const px = (value: unknown) => typeof value === 'number' && value !== 0 ? `${value}px` : value;

export const toWebStyle = (style: StyleProp<any>, defaults?: CSSProperties): CSSProperties => {
  const source = flatten(style);
  const result: Record<string, any> = { ...defaults };

  for (const [key, rawValue] of Object.entries(source)) {
    if (rawValue === undefined || rawValue === null) continue;
    if (key === 'paddingHorizontal') {
      result.paddingLeft = px(rawValue); result.paddingRight = px(rawValue); continue;
    }
    if (key === 'paddingVertical') {
      result.paddingTop = px(rawValue); result.paddingBottom = px(rawValue); continue;
    }
    if (key === 'marginHorizontal') {
      result.marginLeft = px(rawValue); result.marginRight = px(rawValue); continue;
    }
    if (key === 'marginVertical') {
      result.marginTop = px(rawValue); result.marginBottom = px(rawValue); continue;
    }
    if (key === 'shadowColor' || key === 'shadowOffset' || key === 'shadowOpacity' || key === 'shadowRadius' || key === 'elevation') continue;
    if (key === 'textAlignVertical') {
      result.verticalAlign = rawValue === 'center' ? 'middle' : rawValue; continue;
    }
    if (key === 'transform' && Array.isArray(rawValue)) {
      result.transform = rawValue.map((entry) => {
        const [name, value] = Object.entries(entry)[0] as [string, any];
        const suffix = typeof value === 'number' && name.startsWith('translate') ? 'px' : '';
        return `${name}(${value}${suffix})`;
      }).join(' ');
      continue;
    }
    result[key] = typeof rawValue === 'number' && !UNITLESS.has(key) ? px(rawValue) : rawValue;
  }

  if (source.shadowColor) {
    const offset = source.shadowOffset || { width: 0, height: 2 };
    result.boxShadow = `${offset.width || 0}px ${offset.height || 0}px ${source.shadowRadius || 4}px ${source.shadowColor}`;
  }

  return result;
};

type CommonProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
  [key: string]: any;
};

export const View = React.forwardRef<HTMLDivElement, CommonProps>(({ style, children, accessibilityLabel, testID, ...props }, ref) => (
  <div ref={ref} style={toWebStyle(style, { display: 'flex', flexDirection: 'column', minWidth: 0 })} aria-label={accessibilityLabel} data-testid={testID} {...props}>
    {children}
  </div>
));
View.displayName = 'View';

export const Text = React.forwardRef<HTMLSpanElement, CommonProps & { numberOfLines?: number }>(
  ({ style, children, numberOfLines, accessibilityLabel, testID, ...props }, ref) => (
    <span
      ref={ref}
      style={toWebStyle(style, numberOfLines ? {
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      } : { display: 'block', minWidth: 0 })}
      aria-label={accessibilityLabel}
      data-testid={testID}
      {...props}
    >
      {children}
    </span>
  ),
);
Text.displayName = 'Text';

export const TouchableOpacity = React.forwardRef<HTMLButtonElement, CommonProps & {
  onPress?: (event?: any) => void;
  disabled?: boolean;
  activeOpacity?: number;
}>(
  ({ style, children, onPress, disabled, activeOpacity: _activeOpacity, accessibilityLabel, testID, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onPress}
      aria-label={accessibilityLabel}
      data-testid={testID}
      style={toWebStyle(style, {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        padding: 0,
        margin: 0,
        background: 'transparent',
        color: 'inherit',
        textAlign: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
      })}
      {...props}
    >
      {children}
    </button>
  ),
);
TouchableOpacity.displayName = 'TouchableOpacity';

export const ScrollView = React.forwardRef<HTMLDivElement, CommonProps & {
  contentContainerStyle?: StyleProp<ViewStyle>;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}>(
  ({ style, contentContainerStyle, children, horizontal, showsVerticalScrollIndicator: _v, showsHorizontalScrollIndicator: _h, ...props }, ref) => (
    <div
      ref={ref}
      style={toWebStyle(style, {
        minWidth: 0,
        minHeight: 0,
        overflowX: horizontal ? 'auto' : 'hidden',
        overflowY: horizontal ? 'hidden' : 'auto',
      })}
      {...props}
    >
      <div style={toWebStyle(contentContainerStyle, { display: 'flex', flexDirection: horizontal ? 'row' : 'column', minWidth: 0 })}>
        {children}
      </div>
    </div>
  ),
);
ScrollView.displayName = 'ScrollView';

interface FlatListProps<T> extends CommonProps {
  data?: T[];
  renderItem?: (info: { item: T; index: number; separators: Record<string, never> }) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  ListEmptyComponent?: React.ReactNode | React.ComponentType;
  ListHeaderComponent?: React.ReactNode | React.ComponentType;
  ListFooterComponent?: React.ReactNode | React.ComponentType;
  contentContainerStyle?: StyleProp<ViewStyle>;
  horizontal?: boolean;
}

export function FlatList<T>({
  data = [], renderItem, keyExtractor, ListEmptyComponent, ListHeaderComponent, ListFooterComponent,
  style, contentContainerStyle, horizontal, ...props
}: FlatListProps<T>) {
  const renderNode = (node: any) => typeof node === 'function' ? React.createElement(node) : node;
  return (
    <div
      style={toWebStyle(style, {
        display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0,
        overflowX: horizontal ? 'auto' : 'hidden', overflowY: horizontal ? 'hidden' : 'auto',
      })}
      {...props}
    >
      <div style={toWebStyle(contentContainerStyle, { display: 'flex', flexDirection: horizontal ? 'row' : 'column', minWidth: 0 })}>
        {renderNode(ListHeaderComponent)}
        {data.length === 0
          ? renderNode(ListEmptyComponent)
          : data.map((item: T, index: number) => (
            <React.Fragment key={keyExtractor ? keyExtractor(item, index) : String(index)}>
              {renderItem?.({ item, index, separators: {} })}
            </React.Fragment>
          ))}
        {renderNode(ListFooterComponent)}
      </div>
    </div>
  );
}

export const TextInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputProps>(
  ({ style, onChangeText, placeholderTextColor, secureTextEntry, keyboardType, editable = true, multiline, numberOfLines, ...props }, ref) => {
    const common = {
      ...props,
      disabled: !editable || props.disabled,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChangeText?.(event.target.value),
      style: toWebStyle(style, {
        display: 'block', minWidth: 0, border: 0, outline: 0, background: 'transparent', resize: multiline ? 'vertical' : undefined,
        ['--placeholder-color' as any]: placeholderTextColor,
      }),
    };
    if (multiline) return <textarea ref={ref as React.Ref<HTMLTextAreaElement>} rows={numberOfLines} {...common as any} />;
    const type = secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : keyboardType === 'phone-pad' ? 'tel' : keyboardType === 'numeric' || keyboardType === 'decimal-pad' ? 'number' : props.type;
    return <input ref={ref as React.Ref<HTMLInputElement>} type={type} {...common as any} />;
  },
);
TextInput.displayName = 'TextInput';

export const Image = ({ source, style, resizeMode = 'cover', accessibilityLabel, ...props }: any) => {
  const src = typeof source === 'string' ? source : source?.uri || source;
  return <img src={src} alt={accessibilityLabel || ''} style={toWebStyle(style, { display: 'block', objectFit: resizeMode })} {...props} />;
};

export const ActivityIndicator = ({ size = 'small', color = '#0f172a', style }: any) => (
  <span
    role="status"
    aria-label="Loading"
    style={toWebStyle(style, {
      width: size === 'large' ? 28 : 18,
      height: size === 'large' ? 28 : 18,
      border: `2px solid ${color}33`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'sanwariya-spin 0.75s linear infinite',
      flexShrink: 0,
    })}
  />
);

export const Modal = ({ visible, children, transparent: _transparent, animationType: _animationType, onRequestClose }: any) => {
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onRequestClose?.();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, onRequestClose]);
  if (!visible) return null;
  return createPortal(children, document.body);
};

export const KeyboardAvoidingView = View;
export const StatusBar = () => null;

export const Platform = {
  OS: 'web' as string,
  select<T>(options: { web?: T; default?: T; ios?: T; android?: T }): T | undefined {
    return options.web ?? options.default;
  },
};

export const Dimensions = {
  get: () => ({ width: window.innerWidth, height: window.innerHeight, scale: window.devicePixelRatio || 1, fontScale: 1 }),
};

export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get());
  useEffect(() => {
    const update = () => setDimensions(Dimensions.get());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return dimensions;
};

export const Alert = {
  alert(title: string, message?: string, buttons?: Array<{ text?: string; style?: string; onPress?: () => void }>) {
    if (!buttons?.length) {
      window.alert([title, message].filter(Boolean).join('\n\n'));
      return;
    }
    const destructive = buttons.find((button) => button.style === 'destructive');
    const action = destructive || buttons.find((button) => button.style !== 'cancel');
    if (action && window.confirm([title, message].filter(Boolean).join('\n\n'))) action.onPress?.();
  },
};

export const StyleSheet = {
  create<T extends Record<string, any>>(styles: T): T { return styles; },
  flatten,
  compose<T>(first: T, second: T): T[] { return [first, second]; },
  absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  absoluteFillObject: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
};
