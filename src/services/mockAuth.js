// Mock authentication service for development
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user database - empty by default
const mockUsers = [];

// Mock OTP storage
let mockOTPs = {};

// Helper function to generate JWT-like token
const generateMockToken = (userId) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    userId, 
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }));
  const signature = btoa(`mock_signature_${userId}_${Date.now()}`);
  return `${header}.${payload}.${signature}`;
};

// Helper function to simulate API delay
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthAPI = {
  // Sign In
  signIn: async (phoneNumber, password) => {
    await delay(1500); // Simulate network delay
    
    const user = mockUsers.find(u => 
      u.phoneNumber === phoneNumber && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid phone number or password');
    }
    
    const token = generateMockToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      data: {
        user: userWithoutPassword,
        token
      }
    };
  },

  // Sign Up
  signUp: async (phoneNumber, password, fullName) => {
    await delay(1500);
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.phoneNumber === phoneNumber);
    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }
    
    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      phoneNumber,
      password,
      fullName,
      email: `user${mockUsers.length + 1}@example.com`,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    const token = generateMockToken(newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
      data: {
        user: userWithoutPassword,
        token
      }
    };
  },

  // Google Sign In
  googleSignIn: async (googleToken) => {
    await delay(1000);
    
    // Mock Google user
    const googleUser = {
      id: 'google_' + Date.now(),
      phoneNumber: '03001111111',
      fullName: 'Google User',
      email: 'googleuser@gmail.com',
      createdAt: new Date().toISOString()
    };
    
    const token = generateMockToken(googleUser.id);
    
    return {
      data: {
        user: googleUser,
        token
      }
    };
  },

  // Send OTP
  sendOTP: async (phoneNumber) => {
    await delay(1000);
    
    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (5 minutes)
    mockOTPs[phoneNumber] = {
      code: otp,
      expiresAt: Date.now() + (5 * 60 * 1000),
      attempts: 0
    };
    
    // In development, log the OTP to console
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
    
    return {
      data: {
        message: 'OTP sent successfully',
        // In development, return OTP for easy testing
        otp: __DEV__ ? otp : undefined
      }
    };
  },

  // Verify OTP
  verifyOTP: async (phoneNumber, otp, password, fullName, isSignup) => {
    await delay(1000);
    
    const storedOTP = mockOTPs[phoneNumber];
    
    if (!storedOTP) {
      throw new Error('No OTP found for this phone number');
    }
    
    if (Date.now() > storedOTP.expiresAt) {
      delete mockOTPs[phoneNumber];
      throw new Error('OTP has expired');
    }
    
    if (storedOTP.code !== otp) {
      storedOTP.attempts += 1;
      if (storedOTP.attempts >= 3) {
        delete mockOTPs[phoneNumber];
        throw new Error('Too many failed attempts. Please request a new OTP');
      }
      throw new Error('Invalid OTP');
    }
    
    // OTP is valid, clear it
    delete mockOTPs[phoneNumber];
    
    let user;
    
    if (isSignup) {
      // Create new user
      const existingUser = mockUsers.find(u => u.phoneNumber === phoneNumber);
      if (existingUser) {
        throw new Error('User with this phone number already exists');
      }
      
      user = {
        id: String(mockUsers.length + 1),
        phoneNumber,
        password,
        fullName,
        email: `user${mockUsers.length + 1}@example.com`,
        createdAt: new Date().toISOString()
      };
      
      mockUsers.push(user);
    } else {
      // Find existing user
      user = mockUsers.find(u => u.phoneNumber === phoneNumber);
      if (!user) {
        throw new Error('User not found');
      }
    }
    
    const token = generateMockToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      data: {
        user: userWithoutPassword,
        token
      }
    };
  },

  // Verify Token
  verifyToken: async (token) => {
    await delay(500);
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (Date.now() > payload.exp) {
        throw new Error('Token expired');
      }
      
      const user = mockUsers.find(u => u.id === payload.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        data: {
          user: userWithoutPassword
        }
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  // Forgot Password
  forgotPassword: async (phoneNumber) => {
    await delay(1000);
    
    const user = mockUsers.find(u => u.phoneNumber === phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate and store OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mockOTPs[phoneNumber] = {
      code: otp,
      expiresAt: Date.now() + (5 * 60 * 1000),
      attempts: 0,
      type: 'password_reset'
    };
    
    console.log(`🔐 Password reset OTP for ${phoneNumber}: ${otp}`);
    
    return {
      data: {
        message: 'Password reset OTP sent successfully',
        otp: __DEV__ ? otp : undefined
      }
    };
  },

  // Reset Password
  resetPassword: async (phoneNumber, otp, newPassword) => {
    await delay(1000);
    
    const storedOTP = mockOTPs[phoneNumber];
    
    if (!storedOTP || storedOTP.type !== 'password_reset') {
      throw new Error('No password reset OTP found');
    }
    
    if (Date.now() > storedOTP.expiresAt) {
      delete mockOTPs[phoneNumber];
      throw new Error('OTP has expired');
    }
    
    if (storedOTP.code !== otp) {
      throw new Error('Invalid OTP');
    }
    
    // Update user password
    const user = mockUsers.find(u => u.phoneNumber === phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.password = newPassword;
    delete mockOTPs[phoneNumber];
    
    return {
      data: {
        message: 'Password reset successfully'
      }
    };
  }
};

// Helper function to get mock users (for development)
export const getMockUsers = () => mockUsers;

// Helper function to clear all mock data
export const clearMockData = () => {
  mockUsers.length = 0;
  mockOTPs = {};
};

// Mock biometric authentication
export const mockBiometricAuth = {
  // Check if biometric authentication is available
  isAvailable: async () => {
    await delay(200);
    // Simulate biometric availability (always true in mock)
    return true;
  },

  // Authenticate using biometrics
  authenticate: async () => {
    await delay(1000);
    
    // Simulate biometric authentication
    // In real implementation, this would use device biometrics
    const success = Math.random() > 0.2; // 80% success rate for demo
    
    if (success) {
      return {
        success: true,
        message: 'Biometric authentication successful'
      };
    } else {
      return {
        success: false,
        error: 'Biometric authentication failed'
      };
    }
  }
};