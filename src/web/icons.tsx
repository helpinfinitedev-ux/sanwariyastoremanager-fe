import React from 'react';
import {
  AlertCircle, ArrowDownCircle, ArrowLeft, ArrowRightCircle, ArrowUpCircle, BarChart3,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CirclePlus, CloudUpload, CreditCard, FileText, Filter, Grid2X2, Info, List, LogOut,
  Menu, Moon, Package, Pencil, Phone, Plus, ReceiptText, Search, ShieldCheck, ShoppingCart,
  Store, Sun, Trash2, User, Users, Utensils, WalletCards, X, XCircle, Clock3, Building2,
  ArrowLeftRight, Bell, Mail, LockKeyhole, Calculator, Eye, EyeOff, TriangleAlert, type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  add: Plus,
  'add-circle-outline': CirclePlus,
  'alert-circle': AlertCircle,
  'alert-circle-outline': AlertCircle,
  'arrow-back': ArrowLeft,
  'arrow-down-circle': ArrowDownCircle,
  'arrow-down-circle-outline': ArrowDownCircle,
  'arrow-forward-circle': ArrowRightCircle,
  'arrow-forward-circle-outline': ArrowRightCircle,
  'arrow-up-circle': ArrowUpCircle,
  'arrow-up-circle-outline': ArrowUpCircle,
  'bar-chart': BarChart3,
  'bar-chart-outline': BarChart3,
  'basket-outline': ShoppingCart,
  'business-outline': Building2,
  'calendar-outline': CalendarDays,
  'calculator-outline': Calculator,
  'call-outline': Phone,
  'card-outline': CreditCard,
  cart: ShoppingCart,
  'cart-outline': ShoppingCart,
  'cash-outline': WalletCards,
  checkmark: Check,
  'checkmark-circle-outline': CheckCircle2,
  'chevron-back': ChevronLeft,
  'chevron-down': ChevronDown,
  'chevron-forward': ChevronRight,
  'chevron-up': ChevronUp,
  close: X,
  'close-circle': XCircle,
  'cloud-upload-outline': CloudUpload,
  'create-outline': Pencil,
  'cube': Package,
  'cube-outline': Package,
  'document-text-outline': FileText,
  filter: Filter,
  'grid-outline': Grid2X2,
  'information-circle-outline': Info,
  list: List,
  'log-out-outline': LogOut,
  'menu-outline': Menu,
  'moon-outline': Moon,
  'notifications-outline': Bell,
  people: Users,
  'people-outline': Users,
  person: User,
  'person-outline': User,
  receipt: ReceiptText,
  'receipt-outline': ReceiptText,
  restaurant: Utensils,
  'restaurant-outline': Utensils,
  search: Search,
  'search-outline': Search,
  'shield-checkmark-outline': ShieldCheck,
  storefront: Store,
  'storefront-outline': Store,
  'sunny-outline': Sun,
  'swap-horizontal': ArrowLeftRight,
  'swap-horizontal-outline': ArrowLeftRight,
  'swap-vertical-outline': ArrowLeftRight,
  time: Clock3,
  'time-outline': Clock3,
  trash: Trash2,
  'trash-outline': Trash2,
  wallet: WalletCards,
  'wallet-outline': WalletCards,
  email: Mail,
  password: LockKeyhole,
  'eye-outline': Eye,
  'eye-off-outline': EyeOff,
  'warning-outline': TriangleAlert,
};

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties | React.CSSProperties[];
};

export const Ionicons = ({ name, size = 24, color = 'currentColor', style }: IconProps) => {
  const Icon = icons[name] || CirclePlus;
  const mergedStyle = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
  return <Icon aria-hidden="true" size={size} color={color} strokeWidth={1.8} style={mergedStyle} />;
};

Ionicons.glyphMap = icons;
