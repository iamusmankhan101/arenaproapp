// Development configuration
export const DEV_CONFIG = {
  // Set to false to show login screen, true to bypass automatically
  BYPASS_AUTH: __DEV__ && false, // Changed to false

  // Network fallback settings
  ENABLE_NETWORK_FALLBACK: __DEV__ && true,
  NETWORK_TIMEOUT: 10000, // 10 seconds
  MAX_RETRY_ATTEMPTS: 3,

  // Mock user for development bypass
  MOCK_USER: {
    id: 'dev_user_1',
    phoneNumber: '03001234567',
    fullName: 'John Developer',
    email: 'john.dev@arenapro.pk',
    createdAt: new Date().toISOString()
  },

  // Mock token for development
  MOCK_TOKEN: 'dev_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',

  // API Configuration
  API_BASE_URL: __DEV__ ? 'http://localhost:3001/api' : 'https://api.arenapro.pk/api',

  // Mock API toggle
  USE_MOCK_API: __DEV__, // Use mock API in development

  // Admin Configuration
  ADMIN_API_BASE_URL: __DEV__ ? 'http://localhost:3001/api' : 'https://api.arenapro.pk/api',

  // Feature flags
  ENABLE_ADMIN_PANEL: true,
  ENABLE_TEAM_CHALLENGES: true,
  ENABLE_PUSH_NOTIFICATIONS: true,

  // Other development settings
  SHOW_DEV_HELPER: __DEV__ && true,
  LOG_API_CALLS: __DEV__ && true,
  MOCK_API_DELAY: 1000, // milliseconds

  // Debug settings
  ENABLE_REDUX_LOGGER: __DEV__,
  ENABLE_FLIPPER: __DEV__,

  // App settings
  DEFAULT_LOCATION: {
    latitude: 24.8607, // Changed to Karachi where sample venues are located
    longitude: 67.0011,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },

  // Booking settings
  MAX_BOOKING_DAYS_AHEAD: 30,
  MIN_BOOKING_HOURS_AHEAD: 2,

  // Payment settings
  PAYMENT_TIMEOUT: 300000, // 5 minutes

  // Cache settings
  CACHE_DURATION: 300000, // 5 minutes

  // Admin settings
  ADMIN_SESSION_TIMEOUT: 3600000, // 1 hour
  ADMIN_AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
};

// Helper function to check if we should bypass auth
export const shouldBypassAuth = () => {
  return DEV_CONFIG.BYPASS_AUTH && __DEV__;
};

// Helper function to get mock credentials
export const getMockCredentials = () => {
  return {
    user: DEV_CONFIG.MOCK_USER,
    token: DEV_CONFIG.MOCK_TOKEN
  };
};

// Helper function to handle network fallback
export const shouldUseNetworkFallback = () => {
  return DEV_CONFIG.ENABLE_NETWORK_FALLBACK && __DEV__;
};

// Network status helper
export const checkNetworkStatus = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEV_CONFIG.NETWORK_TIMEOUT);

    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.log('Network check failed:', error.message);
    return false;
  }
};