// Backend Configuration
// Choose between 'mongodb' or 'firebase'
export const BACKEND_TYPE = 'firebase'; // Changed to Firebase

// API Configuration based on backend type
export const getAPIConfig = () => {
  if (BACKEND_TYPE === 'firebase') {
    return {
      type: 'firebase',
      useFirebaseAPI: true,
      baseURL: null, // Firebase doesn't use REST endpoints
      description: 'Using Firebase/Firestore as backend'
    };
  } else {
    return {
      type: 'mongodb',
      useFirebaseAPI: false,
      baseURL: 'http://localhost:3001/api',
      description: 'Using MongoDB with Express.js backend'
    };
  }
};

// Helper function to get the appropriate API service
export const getAPIService = () => {
  const config = getAPIConfig();
  
  if (config.useFirebaseAPI) {
    // Import Firebase API services
    return import('../services/firebaseAPI.js');
  } else {
    // Import traditional REST API services
    return import('../services/api.js');
  }
};