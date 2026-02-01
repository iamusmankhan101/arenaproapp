import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase config (same as mobile app)
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

console.log('🕐 Testing Time Slots Generation...');

// Function to generate time slots
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
      startTime: startTime,
      endTime: endTime,
      price: price,
      available: true
    });
  }
  return slots;
}

async function testTimeSlotsGeneration() {
  try {
    // Get all venues
    console.log('📋 Fetching all venues...');
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    if (snapshot.empty) {
      console.log('❌ No venues found');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} venues`);
    
    // Process each venue
    for (const venueDoc of snapshot.docs) {
      const venueData = venueDoc.data();
      const venueId = venueDoc.id;
      
      console.log(`\n🏟️ Processing venue: ${venueData.name} (ID: ${venueId})`);
      
      // Check if venue already has time slots
      if (venueData.timeSlots && venueData.timeSlots.length > 0) {
        console.log(`   ✅ Already has ${venueData.timeSlots.length} time slots`);
        continue;
      }
      
      // Get venue details for time slot generation
      const basePrice = venueData.pricing?.basePrice || venueData.basePrice || 2000;
      const openTime = venueData.operatingHours?.open || venueData.openTime || '06:00';
      const closeTime = venueData.operatingHours?.close || venueData.closeTime || '23:00';
      
      console.log(`   📊 Base price: PKR ${basePrice}`);
      console.log(`   🕐 Operating hours: ${openTime} - ${closeTime}`);
      
      // Generate time slots
      const timeSlots = generateTimeSlots(basePrice, openTime, closeTime);
      console.log(`   🕐 Generated ${timeSlots.length} time slots`);
      
      // Update venue with time slots
      const venueRef = doc(db, 'venues', venueId);
      await updateDoc(venueRef, {
        timeSlots: timeSlots,
        updatedAt: new Date()
      });
      
      console.log(`   ✅ Updated venue with time slots`);
    }
    
    console.log('\n🎉 Time slots generation completed!');
    console.log('💡 All venues now have time slots available for booking.');
    
  } catch (error) {
    console.error('❌ Error testing time slots generation:', error);
  }
}

testTimeSlotsGeneration();