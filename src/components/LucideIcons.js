import React from 'react';
import { View } from 'react-native';

// Using Expo vector icons which work out of the box with Expo
import { MaterialIcons } from '@expo/vector-icons';

// Icon mapping from Material Icons to Lucide-style names
const iconMap = {
  // Navigation
  'arrow-left': 'arrow-back',
  'arrow-right': 'arrow-forward', 
  'arrow-up': 'arrow-upward',
  'arrow-down': 'arrow-downward',
  'x': 'close',
  'menu': 'menu',
  'more-vertical': 'more-vert',
  'more-horizontal': 'more-horiz',
  
  // Common actions
  'plus': 'add',
  'minus': 'remove',
  'edit': 'edit',
  'trash-2': 'delete',
  'search': 'search',
  'filter': 'filter-list',
  'arrow-up-down': 'sort',
  'refresh-cw': 'refresh',
  'share': 'share',
  'download': 'download',
  'upload': 'upload',
  
  // User & Profile
  'user': 'person',
  'users': 'people',
  'user-circle': 'account-circle',
  
  // Communication
  'mail': 'email',
  'phone': 'phone',
  'message-circle': 'message',
  'message-square': 'chat',
  'bell': 'notifications',
  'bell-ring': 'notification-important',
  
  // Security & Auth
  'lock': 'lock',
  'unlock': 'lock-open',
  'eye': 'visibility',
  'eye-off': 'visibility-off',
  'fingerprint': 'fingerprint',
  'shield': 'security',
  'shield-check': 'verified',
  
  // Location & Maps
  'map-pin': 'location-on',
  'map': 'map',
  'navigation': 'navigation',
  'locate': 'my-location',
  'route': 'directions',
  
  // Time & Calendar
  'clock': 'schedule',
  'calendar': 'event',
  'calendar-days': 'today',
  'calendar-range': 'date-range',
  'timer': 'timer',
  
  // Sports & Activities
  'football': 'sports-soccer',
  'zap': 'flash-on', // closest alternative for cricket
  'circle': 'radio-button-unchecked',
  'activity': 'fitness-center',
  'dumbbell': 'fitness-center',
  
  // Home & Navigation
  'home': 'home',
  'layout-dashboard': 'dashboard',
  'compass': 'explore',
  'heart': 'favorite',
  'bookmark': 'bookmark',
  
  // Settings & Config
  'settings': 'settings',
  'sliders': 'tune',
  'wrench': 'build',
  'info': 'info',
  'help-circle': 'help',
  'alert-triangle': 'warning',
  'alert-circle': 'error',
  'check': 'check',
  'check-circle': 'check-circle',
  
  // Media & Content
  'image': 'image',
  'video': 'videocam',
  'play': 'play-arrow',
  'pause': 'pause',
  'square': 'stop',
  'volume-2': 'volume-up',
  'volume-x': 'volume-off',
  
  // Shopping & Commerce
  'shopping-cart': 'shopping-cart',
  'credit-card': 'payment',
  'receipt': 'receipt',
  'tag': 'local-offer',
  'star': 'star',
  
  // Files & Documents
  'folder': 'folder',
  'file': 'insert-drive-file',
  'file-text': 'description',
  'cloud': 'cloud',
  'cloud-upload': 'cloud-upload',
  'cloud-download': 'cloud-download',
  
  // Connectivity
  'wifi': 'wifi',
  'bluetooth': 'bluetooth',
  'signal': 'signal-cellular-4-bar',
  'battery': 'battery-full',
  'power': 'power',
  
  // Miscellaneous
  'trophy': 'emoji-events',
  'thumbs-up': 'thumb-up',
  'thumbs-down': 'thumb-down',
  'flag': 'flag',
  'globe': 'language',
  'languages': 'translate',
  'search-x': 'search-off',
  'dollar-sign': 'monetization-on',
  'chevron-right': 'chevron-right',
  'history': 'history',
  'smartphone': 'smartphone',
  'log-out': 'logout',
  'hash': 'tag',
  'trending-up': 'trending-up',
};

// Lucide Icon Component
export const LucideIcon = ({ name, size = 24, color = '#000', style, ...props }) => {
  // Map lucide names to Material Icons names
  const materialIconName = iconMap[name] || name;
  
  return (
    <View style={style}>
      <MaterialIcons 
        name={materialIconName} 
        size={size} 
        color={color} 
        {...props} 
      />
    </View>
  );
};

// Export individual icons for convenience
export const ArrowLeft = (props) => <LucideIcon name="arrow-left" {...props} />;
export const ArrowRight = (props) => <LucideIcon name="arrow-right" {...props} />;
export const ArrowUp = (props) => <LucideIcon name="arrow-up" {...props} />;
export const ArrowDown = (props) => <LucideIcon name="arrow-down" {...props} />;
export const X = (props) => <LucideIcon name="x" {...props} />;
export const Menu = (props) => <LucideIcon name="menu" {...props} />;
export const Plus = (props) => <LucideIcon name="plus" {...props} />;
export const Minus = (props) => <LucideIcon name="minus" {...props} />;
export const Search = (props) => <LucideIcon name="search" {...props} />;
export const Filter = (props) => <LucideIcon name="filter" {...props} />;
export const User = (props) => <LucideIcon name="user" {...props} />;
export const Users = (props) => <LucideIcon name="users" {...props} />;
export const Mail = (props) => <LucideIcon name="mail" {...props} />;
export const Phone = (props) => <LucideIcon name="phone" {...props} />;
export const Lock = (props) => <LucideIcon name="lock" {...props} />;
export const Eye = (props) => <LucideIcon name="eye" {...props} />;
export const EyeOff = (props) => <LucideIcon name="eye-off" {...props} />;
export const MapPin = (props) => <LucideIcon name="map-pin" {...props} />;
export const Map = (props) => <LucideIcon name="map" {...props} />;
export const Clock = (props) => <LucideIcon name="clock" {...props} />;
export const Calendar = (props) => <LucideIcon name="calendar" {...props} />;
export const Home = (props) => <LucideIcon name="home" {...props} />;
export const Heart = (props) => <LucideIcon name="heart" {...props} />;
export const Settings = (props) => <LucideIcon name="settings" {...props} />;
export const Star = (props) => <LucideIcon name="star" {...props} />;
export const Check = (props) => <LucideIcon name="check" {...props} />;
export const Info = (props) => <LucideIcon name="info" {...props} />;
export const AlertTriangle = (props) => <LucideIcon name="alert-triangle" {...props} />;
export const Football = (props) => <LucideIcon name="football" {...props} />;
export const Trophy = (props) => <LucideIcon name="trophy" {...props} />;
export const SearchX = (props) => <LucideIcon name="search-x" {...props} />;
export const DollarSign = (props) => <LucideIcon name="dollar-sign" {...props} />;
export const Fingerprint = (props) => <LucideIcon name="fingerprint" {...props} />;
export const ChevronRight = (props) => <LucideIcon name="chevron-right" {...props} />;
export const History = (props) => <LucideIcon name="history" {...props} />;
export const Smartphone = (props) => <LucideIcon name="smartphone" {...props} />;
export const LogOut = (props) => <LucideIcon name="log-out" {...props} />;
export const CreditCard = (props) => <LucideIcon name="credit-card" {...props} />;
export const Hash = (props) => <LucideIcon name="hash" {...props} />;
export const TrendingUp = (props) => <LucideIcon name="trending-up" {...props} />;
export const Activity = (props) => <LucideIcon name="activity" {...props} />;

// Additional missing icons
export const Bell = (props) => <LucideIcon name="bell" {...props} />;
export const Edit = (props) => <LucideIcon name="edit" {...props} />;
export const Trash2 = (props) => <LucideIcon name="trash-2" {...props} />;
export const Share = (props) => <LucideIcon name="share" {...props} />;

// Additional commonly used icons
export const ChevronLeft = (props) => <LucideIcon name="arrow-left" {...props} />;
export const ChevronUp = (props) => <LucideIcon name="arrow-up" {...props} />;
export const ChevronDown = (props) => <LucideIcon name="arrow-down" {...props} />;
export const MoreVertical = (props) => <LucideIcon name="more-vertical" {...props} />;
export const MoreHorizontal = (props) => <LucideIcon name="more-horizontal" {...props} />;
export const Refresh = (props) => <LucideIcon name="refresh-cw" {...props} />;

// Export Icon as an alias for LucideIcon for compatibility
export const Icon = LucideIcon;

export default LucideIcon;