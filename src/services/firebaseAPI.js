import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  GeoPoint,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { safeDate, isValidDate, safeDateString, safeToISOString, safeFirestoreTimestampToISO } from '../utils/dateUtils';
import api from './api';

// Helper function to serialize Firestore data and handle timestamps
const serializeFirestoreData = (data) => {
  if (!data) return data;

  const serialized = { ...data };

  // Handle timestamp fields
  if (data.createdAt?.toDate) {
    serialized.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data.updatedAt?.toDate) {
    serialized.updatedAt = data.updatedAt.toDate().toISOString();
  }

  // Handle GeoPoint (coordinates field)
  if (data.coordinates && typeof data.coordinates.latitude === 'number' && typeof data.coordinates.longitude === 'number') {
    serialized.coordinates = {
      latitude: data.coordinates.latitude,
      longitude: data.coordinates.longitude
    };
  }

  // Handle nested objects that might contain timestamps or GeoPoints
  Object.keys(serialized).forEach(key => {
    const value = serialized[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's a timestamp
      if (value.toDate && typeof value.toDate === 'function') {
        serialized[key] = value.toDate().toISOString();
      }
      // Check if it's a GeoPoint
      else if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
        serialized[key] = {
          latitude: value.latitude,
          longitude: value.longitude
        };
      }
      // Recursively serialize nested objects
      else {
        serialized[key] = serializeFirestoreData(value);
      }
    }
  });

  return serialized;
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// Turf/Venue API
export const turfAPI = {
  // Get nearby turfs - now returns all active venues without location filtering
  async getNearbyTurfs(latitude, longitude, radius = 10) {
    try {
      console.log('🏟️ Mobile app: Fetching all active venues (no location filtering)...');
      const turfsRef = collection(db, 'venues');
      const q = query(turfsRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      console.log(`📊 Mobile app: Found ${snapshot.size} total active venues in database`);

      const turfs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        console.log(`📍 Mobile app: Adding venue ${data.name} to results`);

        const serializedData = serializeFirestoreData({
          id: doc.id,
          ...data,
          distance: 0, // Set distance to 0 since we're not filtering by location
          // Add compatibility fields for existing components
          sport: Array.isArray(data.sports) ? data.sports[0] : (typeof data.sports === 'string' ? data.sports.split(',')[0].trim() : 'Unknown'),
          pricePerHour: data.pricing?.basePrice || 0,
          time: `${data.operatingHours?.open || '6:00'} to ${data.operatingHours?.close || '23:00'} (All Days)`
        });

        turfs.push(serializedData);
      });

      // Sort by name instead of distance
      turfs.sort((a, b) => a.name.localeCompare(b.name));

      console.log(`✅ Mobile app: Returning ${turfs.length} venues (all active venues)`);
      return { data: turfs };
    } catch (error) {
      console.error('❌ Mobile app: Error fetching venues:', error);
      throw error;
    }
  },

  // Get turf details
  async getTurfDetails(turfId) {
    try {
      const turfRef = doc(db, 'venues', turfId);
      const turfSnap = await getDoc(turfRef);

      if (!turfSnap.exists()) {
        throw new Error('Turf not found');
      }

      const data = turfSnap.data();
      const serializedData = serializeFirestoreData({
        id: turfSnap.id,
        ...data
      });

      return { data: serializedData };
    } catch (error) {
      console.error('Error fetching turf details:', error);
      throw error;
    }
  },

  // Toggle favorite
  async toggleFavorite(turfId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        // Return false if user is not authenticated instead of throwing error
        console.log('⚠️ User not authenticated, cannot toggle favorite');
        return { data: { isFavorite: false, message: 'Please sign in to add favorites' } };
      }

      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef,
        where('userId', '==', user.uid),
        where('turfId', '==', turfId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Add to favorites
        await addDoc(favoritesRef, {
          userId: user.uid,
          turfId: turfId,
          createdAt: serverTimestamp()
        });
        return { data: { isFavorite: true } };
      } else {
        // Remove from favorites
        const favoriteDoc = snapshot.docs[0];
        await deleteDoc(doc(db, 'favorites', favoriteDoc.id));
        return { data: { isFavorite: false } };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Return false instead of throwing error to prevent app crashes
      return { data: { isFavorite: false, error: error.message } };
    }
  },

  // Get user favorites
  async getFavorites() {
    try {
      const user = auth.currentUser;
      if (!user) {
        // Return empty array if user is not authenticated instead of throwing error
        console.log('⚠️ User not authenticated, returning empty favorites');
        return { data: [] };
      }

      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const favoriteIds = snapshot.docs.map(doc => doc.data().turfId);

      if (favoriteIds.length === 0) {
        return { data: [] };
      }

      // Get turf details for favorites
      const turfsRef = collection(db, 'venues');
      const favorites = [];

      for (const turfId of favoriteIds) {
        const turfDoc = await getDoc(doc(turfsRef, turfId));
        if (turfDoc.exists()) {
          favorites.push({
            id: turfDoc.id,
            ...turfDoc.data()
          });
        }
      }

      return { data: favorites };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Return empty array instead of throwing error to prevent app crashes
      return { data: [] };
    }
  },

  // Upload image
  async uploadImage(uri, path) {
    try {
      console.log('📤 Uploading image:', path);

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Image uploaded successfully:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  }
};

// Booking API
export const bookingAPI = {
  // Get available slots
  async getAvailableSlots(turfId, date) {
    try {
      console.log(`🕐 Mobile: Fetching available slots for venue ${turfId} on ${date}`);

      // First, get the venue's time slots from the venue document
      const venueRef = doc(db, 'venues', turfId);
      const venueSnap = await getDoc(venueRef);

      if (!venueSnap.exists()) {
        console.log(`❌ Mobile: Venue ${turfId} not found`);
        throw new Error('Venue not found');
      }

      const venueData = venueSnap.data();

      // Only use date-specific slots - no fallback to general time slots
      let venueTimeSlots = [];

      if (venueData.dateSpecificSlots) {
        console.log('🔍 DEBUG: Available date keys in Firestore:', Object.keys(venueData.dateSpecificSlots));

        // Try exact match first
        if (venueData.dateSpecificSlots[date]) {
          venueTimeSlots = venueData.dateSpecificSlots[date];
          console.log(`📊 Mobile: Found exact match for ${date}`);
        }
        // Try generic match (e.g. if stored as M/D/YYYY but queried as YYYY-MM-DD)
        else {
          // Basic fallback check - maybe implement more robust matching later
          console.log(`⚠️ Mobile: No exact match for ${date}`);
        }
      }

      if (venueTimeSlots.length > 0) {
        console.log(`📊 Mobile: Using date-specific slots for ${date}: ${venueTimeSlots.length} slots configured`);
      } else {
        console.log(`⚠️ Mobile: No date-specific slots configured for ${date}`);
        return { data: [] };
      }

      if (venueTimeSlots.length === 0) {
        console.log('⚠️ Mobile: No time slots configured for this venue/date');
        return { data: [] };
      }

      // Filter to only show selected slots (admin-configured availability)
      const selectedSlots = venueTimeSlots.filter(slot => slot.selected !== false);
      console.log(`📊 Mobile: ${selectedSlots.length}/${venueTimeSlots.length} slots are selected by admin`);

      if (selectedSlots.length === 0) {
        console.log('⚠️ Mobile: No slots selected by admin for this venue/date');
        return { data: [] };
      }

      // Try to get existing bookings for this date (using exact string match)
      let bookedIntervals = [];
      try {
        const bookingsRef = collection(db, 'bookings');
        // Fix: Query by exact date string since booking.date is stored as string "YYYY-MM-DD"
        // Previous logic using startOfDay/endOfDay (Date objects) failed because Firestore can't compare String field with Date objects
        const q = query(bookingsRef,
          where('turfId', '==', turfId),
          where('date', '==', date),
          where('status', 'in', ['confirmed', 'pending'])
        );

        const snapshot = await getDocs(q);
        bookedIntervals = snapshot.docs.map(doc => {
          const booking = doc.data();
          return {
            start: booking.startTime,
            end: booking.endTime
          };
        });

        console.log(`📋 Mobile: Found ${bookedIntervals.length} bookings for ${date}:`, bookedIntervals);
      } catch (error) {
        console.warn('⚠️ Mobile: Error fetching bookings:', error.message);
        bookedIntervals = [];
      }

      // Helper to convert time "HH:MM" to minutes for comparison
      const timeToMinutes = (t) => {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };

      // Mark selected slots as available/unavailable based on overlapping bookings
      const availableSlots = selectedSlots.map(slot => {
        const slotStart = slot.time || slot.startTime;
        const slotEnd = slot.endTime;

        // Calculate slot interval
        const s1 = timeToMinutes(slotStart);
        // If endTime is missing, assume 1 hour duration as fallback
        const e1 = slotEnd ? timeToMinutes(slotEnd) : s1 + 60;

        // Check if this slot overlaps with ANY booked interval
        // Overlap Logic: (StartA < EndB) && (StartB < EndA)
        const isBooked = bookedIntervals.some(booking => {
          const s2 = timeToMinutes(booking.start);
          const e2 = timeToMinutes(booking.end);
          return s1 < e2 && s2 < e1;
        });

        return {
          ...slot,
          // Ensure both time and startTime fields exist for compatibility
          time: slotStart,
          startTime: slotStart,
          available: !isBooked
        };
      });

      console.log(`✅ Mobile: Returning ${availableSlots.length} date-specific time slots (${availableSlots.filter(s => s.available).length} available)`);

      // Log sample slots for debugging
      if (availableSlots.length > 0) {
        console.log(`📋 Mobile: Sample slots:`, availableSlots.slice(0, 3).map(slot =>
          `${slot.time} - ${slot.endTime} (PKR ${slot.price}) [Available: ${slot.available}]`
        ));
      }

      return { data: availableSlots };
    } catch (error) {
      console.error('❌ Mobile: Error fetching available slots:', error);
      throw error;
    }
  },

  // Create booking with extensive debugging
  async createBooking(bookingData) {
    console.log('🔥 FIREBASE: createBooking called with data:', bookingData);

    try {
      const user = auth.currentUser;
      console.log('🔥 FIREBASE: Current user:', user ? { uid: user.uid, email: user.email } : 'No user');

      if (!user) {
        console.log('⚠️ FIREBASE: User not authenticated, creating guest booking');
        // For guest bookings, we'll use a temporary guest ID
        const guestId = `guest_${Date.now()}`;

        const bookingRef = await addDoc(collection(db, 'bookings'), {
          ...bookingData,
          userId: guestId,
          userType: 'guest',
          status: 'pending', // Guest bookings start as pending
          paymentStatus: bookingData.advancePaid ? 'partial' : 'pending',
          advancePaid: bookingData.advancePaid || 0,
          remainingAmount: bookingData.remainingAmount || 0,
          bookingReference: `PIT${Date.now().toString().slice(-6)}`,
          createdAt: serverTimestamp(),
          guestInfo: {
            requiresSignIn: true,
            message: 'Please sign in to complete your booking'
          }
        });

        console.log('🔥 FIREBASE: Guest booking created with ID:', bookingRef.id);

        return {
          data: {
            id: bookingRef.id,
            ...bookingData,
            status: 'pending',
            paymentStatus: bookingData.advancePaid ? 'partial' : 'pending',
            bookingReference: `PIT${Date.now().toString().slice(-6)}`,
            requiresSignIn: true,
            message: 'Booking created! Please sign in to complete your booking.'
          }
        };
      }

      console.log('🔥 FIREBASE: Authenticated user booking - fetching venue details...');

      // Get venue details to enrich booking data
      let venueDetails = {};
      try {
        console.log('🔥 FIREBASE: Fetching venue document for turfId:', bookingData.turfId);
        const venueDoc = await getDoc(doc(db, 'venues', bookingData.turfId));

        if (venueDoc.exists()) {
          const venueData = venueDoc.data();
          console.log('🔥 FIREBASE: Venue data found:', {
            name: venueData.name,
            area: venueData.area,
            address: venueData.address,
            sport: venueData.sport
          });

          venueDetails = {
            turfName: venueData.name || 'Sports Venue',
            turfArea: venueData.area || venueData.address || 'Unknown Area',
            sport: venueData.sport || (Array.isArray(venueData.sports) ? venueData.sports[0] : 'Football'),
            address: venueData.address || 'N/A'
          };

          // Only add phoneNumber if it exists and is not empty
          if (venueData.phoneNumber && venueData.phoneNumber.trim()) {
            venueDetails.phoneNumber = venueData.phoneNumber;
          }
        } else {
          console.log('⚠️ FIREBASE: Venue document not found for turfId:', bookingData.turfId);
          venueDetails = {
            turfName: 'Sports Venue',
            turfArea: 'Unknown Area',
            sport: 'Football',
            phoneNumber: 'N/A',
            address: 'N/A'
          };
        }
      } catch (venueError) {
        console.error('❌ FIREBASE: Error fetching venue details:', venueError);
        venueDetails = {
          turfName: 'Sports Venue',
          turfArea: 'Unknown Area',
          sport: 'Football',
          address: 'N/A'
        };
      }

      console.log('🔥 FIREBASE: Venue details prepared:', venueDetails);

      // Create proper dateTime from date and startTime with validation
      console.log('🔥 FIREBASE: Creating dateTime from:', { date: bookingData.date, startTime: bookingData.startTime });

      // Validate date and time inputs
      if (!bookingData.date || !bookingData.startTime) {
        throw new Error('Invalid booking data: date and startTime are required');
      }

      // Extract date part if it's an ISO string, otherwise use as-is
      let dateString = bookingData.date;
      if (typeof dateString === 'string' && dateString.includes('T')) {
        // If it's an ISO timestamp, extract just the date part
        dateString = dateString.split('T')[0];
        console.log('🔥 FIREBASE: Extracted date from ISO string:', dateString);
      }

      // Create dateTime with proper validation using safe utilities
      const bookingDateTime = safeDate(`${dateString}T${bookingData.startTime}:00`);

      // Check if the created date is valid using safe utilities
      if (!isValidDate(bookingDateTime)) {
        console.error('❌ FIREBASE: Invalid date created from:', {
          originalDate: bookingData.date,
          extractedDate: dateString,
          startTime: bookingData.startTime
        });
        throw new Error('Invalid date format in booking data');
      }

      console.log('🔥 FIREBASE: Created valid dateTime:', bookingDateTime.toISOString());

      // Calculate duration with validation
      if (!bookingData.startTime || !bookingData.endTime) {
        throw new Error('Invalid booking data: startTime and endTime are required');
      }

      const startTime = safeDate(`2000-01-01T${bookingData.startTime}:00`);
      const endTime = safeDate(`2000-01-01T${bookingData.endTime}:00`);

      // Validate time objects using safe utilities
      if (!isValidDate(startTime) || !isValidDate(endTime)) {
        console.error('❌ FIREBASE: Invalid time format:', { startTime: bookingData.startTime, endTime: bookingData.endTime });
        throw new Error('Invalid time format in booking data');
      }

      const durationMs = endTime - startTime;
      if (durationMs <= 0) {
        throw new Error('Invalid booking duration: end time must be after start time');
      }

      const durationHours = Math.round(durationMs / (1000 * 60 * 60));
      const duration = `${durationHours} hour${durationHours !== 1 ? 's' : ''}`;
      console.log('🔥 FIREBASE: Calculated duration:', duration);

      // Generate unique booking ID
      const bookingId = `PIT${Date.now().toString().slice(-6)}`;
      console.log('🔥 FIREBASE: Generated booking ID:', bookingId);

      // ===== REFERRAL SYSTEM LOGIC =====
      let referralDiscount = 0;
      let finalTotalAmount = bookingData.totalAmount || 0;
      let referralApplied = false;

      try {
        // Get user document to check referral status
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('💰 REFERRAL: Checking referral eligibility for user:', user.uid);

          // Import referral utilities
          const { isEligibleForReferralDiscount, isReferrerEligibleForReward, REFERRAL_CONSTANTS, calculateDiscountedTotal } = require('../utils/referralUtils');
          const { applyReferralReward, markReferralCompleted } = require('./referralService');

          // Case 1: Start with max booking total


          // Case 2: Check if user is eligible for New User Discount (first booking + was referred)
          if (isEligibleForReferralDiscount(userData)) {
            console.log('✅ REFERRAL: User is eligible for NEW USER discount!');

            const discountResult = calculateDiscountedTotal(finalTotalAmount, REFERRAL_CONSTANTS.NEW_USER_DISCOUNT);
            referralDiscount = discountResult.discountApplied;
            finalTotalAmount = discountResult.finalTotal;
            referralApplied = true;

            console.log(`💰 REFERRAL: Applied Rs. ${referralDiscount} new user discount`);
          }
          // Case 3: Check if user is eligible for Referrer Reward (2nd booking discount)
          else if (userData.referralDiscountEligible) {
            console.log('✅ REFERRAL: User is eligible for REFERRER REWARD discount!');

            const discountResult = calculateDiscountedTotal(finalTotalAmount, REFERRAL_CONSTANTS.REFERRER_REWARD);
            referralDiscount = discountResult.discountApplied;
            finalTotalAmount = discountResult.finalTotal;
            referralApplied = true;

            // Mark discount as used immediately in local state, update in DB later
            console.log(`💰 REFERRAL: Applied Rs. ${referralDiscount} referrer discount`);
          }

          // If frontend already applied the discount, we shouldn't apply it again to the total
          if (bookingData.referralDiscountApplied && referralApplied) {
            console.log('💰 REFERRAL: Discount already applied by frontend. keeping total as is.');
            // Maintain the total sent by frontend, but ensure we still mark it as used in the DB
            finalTotalAmount = bookingData.totalAmount;
            referralDiscount = bookingData.referralDiscountAmount || referralDiscount;
          } else if (bookingData.referralDiscountApplied && !referralApplied) {
            // Frontend said applied, but backend says not eligible?
            console.warn('⚠️ REFERRAL: Frontend applied discount but backend says not eligible. Reverting total?');
            // For safety, force the recalculated total (which is higher)
            // finalTotalAmount = finalTotalAmount; // from above calculation
          }

          // Recalculate remaining amount just in case, based on the FINAL total
          const advancePaid = bookingData.advancePaid || 0;
          const remainingAmount = Math.max(0, finalTotalAmount - advancePaid);

          // Update booking data with correct remaining amount
          bookingData.remainingAmount = remainingAmount;

          // Check if referrer should indicate reward (user just completed first booking)
          // Note context: This runs when the referee completes THEIR booking
          if (isReferrerEligibleForReward(userData)) {
            console.log('🎁 REFERRAL: User completed first booking, rewarding referrer!');

            // Apply reward to referrer (mark them eligible for THEIR next booking)
            const rewardResult = await applyReferralReward(
              userData.referredBy,
              user.uid,
              userData.fullName || userData.displayName || 'User'
            );

            if (rewardResult.success) {
              console.log(`✅ REFERRAL: Referrer rewarded with eligibility for Rs. ${REFERRAL_CONSTANTS.REFERRER_REWARD} off`);
            }
          }

          // Update User Data: Mark referral completed, increment booking count, consume discount
          const userUpdates = {
            bookingCount: (userData.bookingCount || 0) + 1, // Manual increment to avoid ReferenceError
            updatedAt: serverTimestamp()
          };

          // If this was their first booking (whether referred or not)
          if (!userData.hasCompletedFirstBooking) {
            userUpdates.hasCompletedFirstBooking = true;
            if (userData.referredBy) {
              userUpdates.referralStatus = 'COMPLETED';
            }
          }

          // If they used a referrer discount, consume it
          if (userData.referralDiscountEligible && referralApplied && !isEligibleForReferralDiscount(userData)) {
            userUpdates.referralDiscountEligible = false; // Consume the discount
            userUpdates.referralDiscountUsed = true; // Track usage logic
          }

          await updateDoc(doc(db, 'users', user.uid), userUpdates);
          console.log('✅ USER UPDATES: Incremented booking count and updated referral status');

        }
      } catch (referralError) {
        console.error('⚠️ REFERRAL: Error processing referral logic:', referralError);
        // Don't fail the booking if referral logic fails
      }
      // ===== END REFERRAL SYSTEM LOGIC =====

      // Authenticated user booking with enriched data
      const enrichedBookingData = {
        ...bookingData,
        ...venueDetails,
        userId: user.uid,
        userType: 'authenticated',
        status: 'confirmed',
        paymentStatus: bookingData.advancePaid ? 'partial' : 'paid', // 'partial' if advance paid, 'paid' if full (though logic enforces advance now)
        advancePaid: bookingData.advancePaid || 0,
        remainingAmount: bookingData.remainingAmount || 0,
        bookingReference: bookingId,
        bookingId: bookingId,
        dateTime: bookingDateTime.toISOString(),
        duration: duration,
        totalAmount: finalTotalAmount,
        originalAmount: bookingData.totalAmount || 0,
        referralDiscount: referralDiscount,
        referralApplied: referralApplied,
        createdAt: serverTimestamp()
      };

      // Filter out undefined values to prevent Firestore errors
      const cleanBookingData = Object.fromEntries(
        Object.entries(enrichedBookingData).filter(([key, value]) => value !== undefined)
      );

      console.log('🔥 FIREBASE: Final enriched booking data (cleaned):', {
        ...cleanBookingData,
        createdAt: '[ServerTimestamp]' // Don't log the actual timestamp object
      });

      console.log('🔥 FIREBASE: Saving booking to Firestore...');
      const bookingRef = await addDoc(collection(db, 'bookings'), cleanBookingData);
      console.log('🔥 FIREBASE: Booking saved successfully with ID:', bookingRef.id);

      const finalResult = {
        data: {
          id: bookingRef.id,
          ...cleanBookingData,
          requiresSignIn: false,
          message: bookingData.advancePaid
            ? `Booking confirmed! Advance paid. Balance due: Rs. ${bookingData.remainingAmount}`
            : (referralApplied
              ? `Booking confirmed! You saved Rs. ${referralDiscount} with your referral code!`
              : 'Booking confirmed successfully!')
        }
      };

      // 5. Send Email Confirmation via Backend (Fire-and-forget)
      try {
        // Use the base URL from our centralized API config
        // This ensures we use the same server as the rest of the app (including local IP vs production)
        const baseUrl = api.defaults.baseURL || 'http://localhost:5000';
        const emailServiceUrl = `${baseUrl}/bookings/send-confirmation`;

        const emailPayload = {
          email: user.email,
          bookingDetails: {
            bookingId: bookingRef.id,
            customerName: user.displayName || user.email.split('@')[0],
            turfName: venueDetails.turfName,
            turfAddress: venueDetails.turfArea,
            date: bookingData.date,
            timeSlot: `${bookingData.startTime} - ${bookingData.endTime}`,
            totalAmount: finalTotalAmount
          }
        };

        console.log('📧 Mobile: Triggering backend email service...');
        // Don't await this, let it run in background so UI is snappy
        fetch(emailServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload)
        }).then(res => res.json())
          .then(data => console.log('📧 Mobile: Email service response:', data))
          .catch(err => console.error('⚠️ Mobile: Failed to call email service:', err));

      } catch (emailError) {
        console.error('⚠️ Mobile: Error preparing email:', emailError);
      }

      console.log('🔥 FIREBASE: Returning booking result with ID:', bookingRef.id);

      return finalResult;
    } catch (error) {
      console.error('❌ FIREBASE: Error creating booking:', error);
      console.error('❌ FIREBASE: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  },

  // Get user bookings with extensive debugging
  async getUserBookings() {
    console.log('🔥 FIREBASE: getUserBookings called');

    try {
      const user = auth.currentUser;
      console.log('🔥 FIREBASE: Current user for getUserBookings:', user ? { uid: user.uid, email: user.email } : 'No user');

      if (!user) {
        console.log('⚠️ FIREBASE: User not authenticated, returning empty bookings');
        return { data: [] };
      }

      console.log('🔥 FIREBASE: Querying bookings for userId:', user.uid);

      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      console.log('🔥 FIREBASE: Executing Firestore query...');
      const snapshot = await getDocs(q);
      console.log('🔥 FIREBASE: Query completed. Document count:', snapshot.docs.length);

      const bookings = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        console.log('🔥 FIREBASE: Processing booking document:', {
          id: data.id,
          turfName: data.turfName,
          dateTime: data.dateTime,
          status: data.status,
          userId: data.userId
        });
        return data;
      });

      console.log('🔥 FIREBASE: Final bookings array:', bookings.map(b => ({
        id: b.id,
        turfName: b.turfName,
        dateTime: b.dateTime,
        status: b.status
      })));

      return { data: bookings };
    } catch (error) {
      console.error('❌ FIREBASE: Error fetching user bookings:', error);
      console.error('❌ FIREBASE: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return { data: [] };
    }
  },

  // Cancel booking
  async cancelBooking(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        paymentStatus: 'refunded',
        cancelledAt: serverTimestamp()
      });

      return { data: { success: true, message: 'Booking cancelled successfully' } };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};

// Team/Challenge API
export const teamAPI = {
  // Get challenges
  async getChallenges() {
    try {
      const challengesRef = collection(db, 'challenges');
      const q = query(challengesRef,
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const challenges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { data: challenges };
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

  // Create challenge
  async createChallenge(challengeData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('⚠️ User not authenticated, cannot create challenge');
        throw new Error('Please sign in to create a challenge');
      }

      const challengeRef = await addDoc(collection(db, 'challenges'), {
        ...challengeData,
        createdBy: user.uid,
        status: 'open',
        createdAt: serverTimestamp()
      });

      return { data: { id: challengeRef.id, ...challengeData } };
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  // Accept challenge
  async acceptChallenge(challengeId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('⚠️ User not authenticated, cannot accept challenge');
        throw new Error('Please sign in to accept a challenge');
      }

      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        acceptedBy: user.uid,
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });

      const updatedChallenge = await getDoc(challengeRef);
      return { data: { id: updatedChallenge.id, ...updatedChallenge.data() } };
    } catch (error) {
      console.error('Error accepting challenge:', error);
      throw error;
    }
  }
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      const bookingsRef = collection(db, 'bookings');
      const turfsRef = collection(db, 'turfs');
      const usersRef = collection(db, 'users');

      // Get all bookings
      const bookingsSnapshot = await getDocs(bookingsRef);
      const bookings = bookingsSnapshot.docs.map(doc => doc.data());

      // Get today's bookings using safe date utilities
      const today = safeDate();
      today.setHours(0, 0, 0, 0);
      const todayBookings = bookings.filter(booking => {
        const bookingDate = safeFirestoreTimestampToISO(booking.createdAt);
        const bookingDateObj = safeDate(bookingDate);
        return isValidDate(bookingDateObj) && bookingDateObj >= today;
      });

      // Calculate revenue
      const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      // Get active turfs count
      const turfsSnapshot = await getDocs(query(turfsRef, where('isActive', '==', true)));

      // Get total users count
      const usersSnapshot = await getDocs(usersRef);

      // Get pending bookings
      const pendingBookings = bookings.filter(b => b.status === 'pending');

      return {
        data: {
          totalBookings: bookings.length,
          todayBookings: todayBookings.length,
          totalRevenue: totalRevenue,
          activeVenues: turfsSnapshot.size,
          totalCustomers: usersSnapshot.size,
          pendingBookings: pendingBookings.length,
          monthlyGrowth: 12.5, // Calculate based on actual data
          revenueGrowth: 8.3,  // Calculate based on actual data
          weeklyStats: [] // Generate based on actual data
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get bookings with pagination
  async getBookings(params = {}) {
    try {
      const bookingsRef = collection(db, 'bookings');
      let q = query(bookingsRef, orderBy('createdAt', 'desc'));

      if (params.filter && params.filter !== 'all') {
        q = query(q, where('status', '==', params.filter));
      }

      if (params.pageSize) {
        q = query(q, limit(parseInt(params.pageSize)));
      }

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        data: {
          data: bookings,
          total: bookings.length,
          page: parseInt(params.page) || 0,
          pageSize: parseInt(params.pageSize) || 25
        }
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }
};

export default {
  turfAPI,
  bookingAPI,
  teamAPI,
  adminAPI
};