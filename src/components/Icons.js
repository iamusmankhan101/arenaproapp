import React from 'react';
import { 
  LucideIcon,
  Home, Map, Search, User, Settings, Plus, Minus, X, Check,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Menu,
  Phone, Mail, Bell, Calendar, Clock, MapPin,
  Heart, Star, Eye, EyeOff, Lock, 
  Edit, Trash2, Share, Filter, Info, AlertTriangle,
  Football, Trophy, Activity
} from './LucideIcons';

// Icon component wrapper for easy usage - now using Lucide
export const Icon = ({ 
  name, 
  size = 24, 
  color = '#000', 
  style,
  ...props 
}) => {
  return (
    <LucideIcon 
      name={name} 
      size={size} 
      color={color} 
      style={style}
      {...props}
    />
  );
};

// Pre-configured sport icons using Lucide
export const SportIcons = {
  Cricket: (props) => <Activity {...props} />, // Using activity as closest alternative
  Football: (props) => <Football {...props} />,
  Padel: (props) => <Activity {...props} />,
  Badminton: (props) => <Activity {...props} />,
  Basketball: (props) => <Activity {...props} />,
  Volleyball: (props) => <Activity {...props} />,
  Tennis: (props) => <Activity {...props} />,
  Golf: (props) => <Activity {...props} />,
};

// Pre-configured app icons using Lucide
export const AppIcons = {
  // Navigation
  Home: (props) => <Home {...props} />,
  Map: (props) => <Map {...props} />,
  Search: (props) => <Search {...props} />,
  Profile: (props) => <User {...props} />,
  Settings: (props) => <Settings {...props} />,
  
  // Actions
  Add: (props) => <Plus {...props} />,
  Edit: (props) => <Edit {...props} />,
  Delete: (props) => <Trash2 {...props} />,
  Save: (props) => <Check {...props} />,
  Share: (props) => <Share {...props} />,
  
  // Communication
  Phone: (props) => <Phone {...props} />,
  Email: (props) => <Mail {...props} />,
  Message: (props) => <Mail {...props} />,
  Notification: (props) => <Bell {...props} />,
  
  // Booking & Events
  Calendar: (props) => <Calendar {...props} />,
  Clock: (props) => <Clock {...props} />,
  Location: (props) => <MapPin {...props} />,
  Booking: (props) => <Calendar {...props} />,
  
  // UI Elements
  ArrowBack: (props) => <ArrowLeft {...props} />,
  ArrowForward: (props) => <ArrowRight {...props} />,
  ArrowUp: (props) => <ArrowUp {...props} />,
  ArrowDown: (props) => <ArrowDown {...props} />,
  Close: (props) => <X {...props} />,
  Menu: (props) => <Menu {...props} />,
  
  // Status & Feedback
  Check: (props) => <Check {...props} />,
  Error: (props) => <AlertTriangle {...props} />,
  Warning: (props) => <AlertTriangle {...props} />,
  Info: (props) => <Info {...props} />,
  
  // Social & Auth (using text for now)
  Google: (props) => <LucideIcon name="globe" {...props} />,
  Facebook: (props) => <LucideIcon name="globe" {...props} />,
  Apple: (props) => <LucideIcon name="globe" {...props} />,
  
  // Visibility
  Eye: (props) => <Eye {...props} />,
  EyeOff: (props) => <EyeOff {...props} />,
  
  // Security
  Lock: (props) => <Lock {...props} />,
  LockOpen: (props) => <LucideIcon name="unlock" {...props} />,
  
  // Rating & Reviews
  Star: (props) => <Star {...props} />,
  StarBorder: (props) => <Star {...props} />,
  Favorite: (props) => <Heart {...props} />,
  FavoriteBorder: (props) => <Heart {...props} />,
  
  // Payment & Money
  Payment: (props) => <LucideIcon name="credit-card" {...props} />,
  Money: (props) => <LucideIcon name="dollar-sign" {...props} />,
  CreditCard: (props) => <LucideIcon name="credit-card" {...props} />,
  
  // Filters & Options
  Filter: (props) => <Filter {...props} />,
  Sort: (props) => <LucideIcon name="arrow-up-down" {...props} />,
  Tune: (props) => <LucideIcon name="sliders" {...props} />,
};

// Feather-style icons - now using Lucide (which is Feather-based)
export const FeatherIcons = {
  Home: (props) => <Home {...props} />,
  Search: (props) => <Search {...props} />,
  User: (props) => <User {...props} />,
  Settings: (props) => <Settings {...props} />,
  Heart: (props) => <Heart {...props} />,
  Star: (props) => <Star {...props} />,
  MapPin: (props) => <MapPin {...props} />,
  Calendar: (props) => <Calendar {...props} />,
  Clock: (props) => <Clock {...props} />,
  Phone: (props) => <Phone {...props} />,
  Mail: (props) => <Mail {...props} />,
  Bell: (props) => <Bell {...props} />,
  Plus: (props) => <Plus {...props} />,
  Minus: (props) => <Minus {...props} />,
  X: (props) => <X {...props} />,
  Check: (props) => <Check {...props} />,
  ChevronLeft: (props) => <ArrowLeft {...props} />,
  ChevronRight: (props) => <ArrowRight {...props} />,
  ChevronUp: (props) => <ArrowUp {...props} />,
  ChevronDown: (props) => <ArrowDown {...props} />,
  Eye: (props) => <Eye {...props} />,
  EyeOff: (props) => <EyeOff {...props} />,
  Lock: (props) => <Lock {...props} />,
  Unlock: (props) => <LucideIcon name="unlock" {...props} />,
};

// iOS style icons - using Lucide equivalents
export const IonIcons = {
  Home: (props) => <Home {...props} />,
  HomeFilled: (props) => <Home {...props} />,
  Search: (props) => <Search {...props} />,
  Person: (props) => <User {...props} />,
  PersonFilled: (props) => <User {...props} />,
  Settings: (props) => <Settings {...props} />,
  Heart: (props) => <Heart {...props} />,
  HeartFilled: (props) => <Heart {...props} />,
  Star: (props) => <Star {...props} />,
  StarFilled: (props) => <Star {...props} />,
  Location: (props) => <MapPin {...props} />,
  Calendar: (props) => <Calendar {...props} />,
  Time: (props) => <Clock {...props} />,
  Call: (props) => <Phone {...props} />,
  Mail: (props) => <Mail {...props} />,
  Notifications: (props) => <Bell {...props} />,
  Add: (props) => <Plus {...props} />,
  Remove: (props) => <Minus {...props} />,
  Close: (props) => <X {...props} />,
  Checkmark: (props) => <Check {...props} />,
  ChevronBack: (props) => <ArrowLeft {...props} />,
  ChevronForward: (props) => <ArrowRight {...props} />,
  ChevronUp: (props) => <ArrowUp {...props} />,
  ChevronDown: (props) => <ArrowDown {...props} />,
  Eye: (props) => <Eye {...props} />,
  EyeOff: (props) => <EyeOff {...props} />,
  LockClosed: (props) => <Lock {...props} />,
  LockOpen: (props) => <LucideIcon name="unlock" {...props} />,
};

// Export the main Icon component
export default Icon;