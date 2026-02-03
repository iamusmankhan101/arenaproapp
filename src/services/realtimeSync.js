import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { store } from '../store/store';
import { setNearbyTurfs } from '../store/slices/turfSlice';

class RealtimeSyncService {
  constructor() {
    this.unsubscribers = new Map();
    this.isInitialized = false;
    this.notificationCallback = null;
    this.lastVenueCount = 0;
  }

  // Set notification callback
  setNotificationCallback(callback) {
    this.notificationCallback = callback;
  }

  // Initialize real-time listeners
  initialize() {
    if (this.isInitialized) return;
    
    console.log('🔄 Initializing real-time sync...');
    this.setupTurfsListener();
    this.isInitialized = true;
  }

  // Setup real-time listener for turfs/venues
  setupTurfsListener() {
    try {
      const turfsRef = collection(db, 'turfs');
      
      // Start with a simpler query first, then add complexity
      // This helps avoid index issues during development
      let q;
      
      // Try the complex query first, fall back to simple if it fails
      try {
        q = query(turfsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
      } catch (indexError) {
        console.warn('⚠️ Complex query failed, using simple query:', indexError.message);
        // Fallback to simpler query without orderBy
        q = query(turfsRef, where('isActive', '==', true));
      }
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('🏟️ Mobile app: Real-time turfs update received');
        console.log(`📊 Mobile app: Snapshot has ${snapshot.size} venues`);
        
        const turfs = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`📍 Mobile app: Processing venue: ${data.name} (${doc.id})`);
          
          turfs.push({
            id: doc.id,
            ...data,
            // Convert Firestore timestamps to ISO strings to avoid Redux serialization issues
            createdAt: (() => {
              try {
                return data.createdAt?.toDate()?.toISOString() || new Date().toISOString();
              } catch (error) {
                console.error('❌ RealtimeSync: Error converting createdAt timestamp:', error);
                return new Date().toISOString();
              }
            })(),
            updatedAt: (() => {
              try {
                return data.updatedAt?.toDate()?.toISOString() || new Date().toISOString();
              } catch (error) {
                console.error('❌ RealtimeSync: Error converting updatedAt timestamp:', error);
                return new Date().toISOString();
              }
            })(),
            // Add compatibility fields for existing components
            sport: data.sports?.[0] || 'Unknown',
            pricePerHour: data.pricing?.basePrice || 0,
            time: `${data.operatingHours?.open || '6:00'} to ${data.operatingHours?.close || '23:00'} (All Days)`
          });
        });
        
        // Sort manually by creation date (newest first) - handle both Date objects and ISO strings
        turfs.sort((a, b) => {
          try {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            
            // Validate dates before comparing
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
              console.warn('❌ RealtimeSync: Invalid dates in sorting, using fallback');
              return 0; // Keep original order if dates are invalid
            }
            
            return dateB - dateA; // Newest first
          } catch (error) {
            console.error('❌ RealtimeSync: Error sorting turfs by date:', error);
            return 0; // Keep original order on error
          }
        });
        
        console.log(`✅ Mobile app: Dispatching ${turfs.length} venues to Redux store`);
        // Update Redux store with new data
        store.dispatch(setNearbyTurfs(turfs));
        
        // Check for new venues and show notification
        const currentVenueCount = turfs.length;
        if (this.lastVenueCount > 0 && currentVenueCount > this.lastVenueCount) {
          const newVenuesCount = currentVenueCount - this.lastVenueCount;
          if (this.notificationCallback) {
            this.notificationCallback(
              `🏟️ ${newVenuesCount} new venue${newVenuesCount > 1 ? 's' : ''} added!`,
              'success'
            );
          }
        }
        this.lastVenueCount = currentVenueCount;
        
        // Log changes for debugging
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('✅ New venue added:', change.doc.data().name);
          }
          if (change.type === 'modified') {
            console.log('📝 Venue updated:', change.doc.data().name);
          }
          if (change.type === 'removed') {
            console.log('🗑️ Venue removed:', change.doc.data().name);
          }
        });
      }, (error) => {
        console.error('❌ Error in turfs listener:', error);
        
        // If the error is about indexes, try a fallback approach
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.log('🔄 Trying fallback query without complex filtering...');
          this.setupFallbackTurfsListener();
        } else {
          if (this.notificationCallback) {
            this.notificationCallback('Failed to sync venues', 'error');
          }
        }
      });
      
      this.unsubscribers.set('turfs', unsubscribe);
      console.log('✅ Turfs real-time listener setup complete');
      
    } catch (error) {
      console.error('❌ Failed to setup turfs listener:', error);
      this.setupFallbackTurfsListener();
    }
  }

  // Fallback listener with minimal filtering
  setupFallbackTurfsListener() {
    try {
      console.log('🔄 Setting up fallback turfs listener...');
      const turfsRef = collection(db, 'turfs');
      
      // Simple query without complex filtering
      const unsubscribe = onSnapshot(turfsRef, (snapshot) => {
        console.log('🏟️ Turfs updated in real-time (fallback mode)');
        
        const turfs = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Filter active venues manually
          if (data.isActive !== false) { // Include if isActive is true or undefined
            turfs.push({
              id: doc.id,
              ...data,
              // Convert Firestore timestamps to ISO strings to avoid Redux serialization issues
              createdAt: (() => {
                try {
                  return data.createdAt?.toDate()?.toISOString() || new Date().toISOString();
                } catch (error) {
                  console.error('❌ RealtimeSync: Error converting createdAt timestamp:', error);
                  return new Date().toISOString();
                }
              })(),
              updatedAt: (() => {
                try {
                  return data.updatedAt?.toDate()?.toISOString() || new Date().toISOString();
                } catch (error) {
                  console.error('❌ RealtimeSync: Error converting updatedAt timestamp:', error);
                  return new Date().toISOString();
                }
              })(),
              // Add compatibility fields for existing components
              sport: data.sports?.[0] || 'Unknown',
              pricePerHour: data.pricing?.basePrice || 0,
              time: `${data.operatingHours?.open || '6:00'} to ${data.operatingHours?.close || '23:00'} (All Days)`
            });
          }
        });
        
        // Sort manually by creation date (newest first) - handle both Date objects and ISO strings
        turfs.sort((a, b) => {
          try {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            
            // Validate dates before comparing
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
              console.warn('❌ RealtimeSync: Invalid dates in sorting, using fallback');
              return 0; // Keep original order if dates are invalid
            }
            
            return dateB - dateA; // Newest first
          } catch (error) {
            console.error('❌ RealtimeSync: Error sorting turfs by date:', error);
            return 0; // Keep original order on error
          }
        });
        
        // Update Redux store with new data
        store.dispatch(setNearbyTurfs(turfs));
        
        console.log(`📊 Loaded ${turfs.length} active venues`);
        
        if (this.notificationCallback && turfs.length > 0) {
          this.notificationCallback(`✅ Synced ${turfs.length} venues`, 'success');
        }
        
      }, (error) => {
        console.error('❌ Error in fallback turfs listener:', error);
        if (this.notificationCallback) {
          this.notificationCallback('Failed to sync venues', 'error');
        }
      });
      
      this.unsubscribers.set('turfs-fallback', unsubscribe);
      console.log('✅ Fallback turfs listener setup complete');
      
    } catch (error) {
      console.error('❌ Failed to setup fallback turfs listener:', error);
    }
  }

  // Setup real-time listener for bookings (optional)
  setupBookingsListener(userId) {
    if (!userId) return;
    
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📅 User bookings updated in real-time');
        
        const bookings = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          bookings.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            startTime: data.startTime?.toDate() || new Date(),
            endTime: data.endTime?.toDate() || new Date()
          });
        });
        
        // You can dispatch to bookings slice here if needed
        // store.dispatch(setUserBookings(bookings));
        
      }, (error) => {
        console.error('❌ Error in bookings listener:', error);
      });
      
      this.unsubscribers.set('bookings', unsubscribe);
      console.log('✅ Bookings real-time listener setup complete');
      
    } catch (error) {
      console.error('❌ Failed to setup bookings listener:', error);
    }
  }

  // Setup real-time listener for challenges
  setupChallengesListener() {
    try {
      const challengesRef = collection(db, 'challenges');
      const q = query(challengesRef, where('status', '==', 'open'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('⚔️ Challenges updated in real-time');
        
        const challenges = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          challenges.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            proposedDateTime: data.proposedDateTime?.toDate() || new Date()
          });
        });
        
        // You can dispatch to team slice here if needed
        // store.dispatch(setChallenges(challenges));
        
      }, (error) => {
        console.error('❌ Error in challenges listener:', error);
      });
      
      this.unsubscribers.set('challenges', unsubscribe);
      console.log('✅ Challenges real-time listener setup complete');
      
    } catch (error) {
      console.error('❌ Failed to setup challenges listener:', error);
    }
  }

  // Start listening for a specific user's data
  startUserSync(userId) {
    console.log('👤 Starting user-specific sync for:', userId);
    this.setupBookingsListener(userId);
  }

  // Stop listening for a specific user's data
  stopUserSync() {
    console.log('👤 Stopping user-specific sync');
    if (this.unsubscribers.has('bookings')) {
      this.unsubscribers.get('bookings')();
      this.unsubscribers.delete('bookings');
    }
  }

  // Cleanup all listeners
  cleanup() {
    console.log('🧹 Cleaning up real-time listeners...');
    this.unsubscribers.forEach((unsubscribe, key) => {
      console.log(`Unsubscribing from ${key}`);
      unsubscribe();
    });
    this.unsubscribers.clear();
    this.isInitialized = false;
  }

  // Get connection status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeListeners: Array.from(this.unsubscribers.keys())
    };
  }
}

// Create singleton instance
const realtimeSyncService = new RealtimeSyncService();

export default realtimeSyncService;