import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔍 Debugging Admin Panel Time Slots Sync...');

async function debugAdminTimeSlots() {
  try {
    // Get all venues
    console.log('📋 Fetching all venues to check time slots structure...');
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    if (snapshot.empty) {
      console.log('❌ No venues found in database');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} venues in database\n`);
    
    // Check each venue's time slots structure
    for (const venueDoc of snapshot.docs) {
      const venueData = venueDoc.data();
      const venueId = venueDoc.id;
      
      console.log(`🏟️ VENUE: ${venueData.name} (ID: ${venueId})`);
      console.log(`   📅 Time Slots: ${venueData.timeSlots?.length || 0} configured`);
      
      // Check if venue has time slots
      if (!venueData.timeSlots || venueData.timeSlots.length === 0) {
        console.log('   ❌ NO TIME SLOTS - This venue needs time slots!');
        
        // Generate default time slots for this venue
        const basePrice = venueData.pricing?.basePrice || 2000;
        const openTime = venueData.operatingHours?.open || '06:00';
        const closeTime = venueData.operatingHours?.close || '23:00';
        
        console.log(`   🔧 Generating time slots (${openTime} - ${closeTime}, PKR ${basePrice})`);
        
        const timeSlots = generateTimeSlots(basePrice, openTime, closeTime);
        
        // Update venue with time slots
        const venueRef = doc(db, 'venues', venueId);
        await updateDoc(venueRef, {
          timeSlots: timeSlots,
          updatedAt: new Date()
        });
        
        console.log(`   ✅ Added ${timeSlots.length} time slots to venue`);
      } else {
        // Check time slots structure
        console.log('   📋 Time slots structure:');
        const sampleSlot = venueData.timeSlots[0];
        console.log(`      Sample slot:`, JSON.stringify(sampleSlot, null, 2));
        
        // Check if slots have required fields
        const requiredFields = ['id', 'time', 'endTime', 'price', 'available'];
        const missingFields = requiredFields.filter(field => !(field in sampleSlot));
        
        if (missingFields.length > 0) {
          console.log(`   ⚠️  Missing fields in time slots: ${missingFields.join(', ')}`);
          console.log('   🔧 This might cause issues in the mobile app');
        } else {
          console.log('   ✅ Time slots structure looks correct');
        }
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Test what the mobile app would receive
    console.log('🧪 Testing what mobile app receives...');
    const testVenue = snapshot.docs[0];
    const testVenueId = testVenue.id;
    
    // Simulate mobile app's getTurfDetails call
    const venueRef = doc(db, 'venues', testVenueId);
    const venueSnap = await getDoc(venueRef);
    
    if (venueSnap.exists()) {
      const mobileData = venueSnap.data();
      console.log(`📱 Mobile app would receive:`);
      console.log(`   - Venue: ${mobileData.name}`);
      console.log(`   - Time slots: ${mobileData.timeSlots?.length || 0}`);
      
      if (mobileData.timeSlots && mobileData.timeSlots.length > 0) {
        console.log(`   - Sample slot: ${mobileData.timeSlots[0].time} - ${mobileData.timeSlots[0].endTime}: PKR ${mobileData.timeSlots[0].price}`);
        console.log('   ✅ Mobile app should show time slots correctly');
      } else {
        console.log('   ❌ Mobile app would receive NO time slots!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging admin time slots:', error);
  }
}

// Function to generate time slots (same as mobile app expects)
function generateTimeSlots(basePrice = 2000, openTime = '06:00', closeTime = '23:00') {
  const slots = [];
  const startHour = parseInt(openTime.split(':')[0]);
  const endHour = parseInt(closeTime.split(':')[0]);
  
  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    // Vary pricing based on time
    let price = basePrice;
    if (hour >= 17 && hour <= 21) price = Math.round(basePrice * 1.25); // Peak hours
    if (hour >= 6 && hour <= 8) price = Math.round(basePrice * 0.9); // Morning discount
    
    slots.push({
      id: `slot-${hour}`,
      time: startTime,
      startTime: startTime, // Both formats for compatibility
      endTime: endTime,
      price: price,
      available: true
    });
  }
  return slots;
}

debugAdminTimeSlots();