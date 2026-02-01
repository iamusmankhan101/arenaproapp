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

console.log('🔍 Debugging New Venue Time Slots Issue...');

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

async function debugNewVenueTimeSlots() {
  try {
    // Get all venues and check their time slots
    console.log('📋 Checking time slots for all venues...');
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    if (snapshot.empty) {
      console.log('❌ No venues found');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} venues\n`);
    
    const venuesWithoutTimeSlots = [];
    
    // Check each venue
    snapshot.forEach((doc) => {
      const data = doc.data();
      const venueId = doc.id;
      
      console.log(`🏟️ VENUE: ${data.name} (ID: ${venueId})`);
      console.log(`   📅 Time Slots: ${data.timeSlots?.length || 0} configured`);
      console.log(`   💰 Base Price: PKR ${data.pricing?.basePrice || data.basePrice || 'N/A'}`);
      console.log(`   🕐 Operating Hours: ${data.operatingHours?.open || data.openTime || 'N/A'} - ${data.operatingHours?.close || data.closeTime || 'N/A'}`);
      
      if (!data.timeSlots || data.timeSlots.length === 0) {
        console.log('   ❌ NO TIME SLOTS - This venue needs time slots!');
        venuesWithoutTimeSlots.push({
          id: venueId,
          name: data.name,
          basePrice: data.pricing?.basePrice || data.basePrice || 2000,
          openTime: data.operatingHours?.open || data.openTime || '06:00',
          closeTime: data.operatingHours?.close || data.closeTime || '23:00'
        });
      } else {
        console.log('   ✅ Has time slots');
        // Show sample time slot
        const sampleSlot = data.timeSlots[0];
        console.log(`   📋 Sample slot: ${sampleSlot.time || sampleSlot.startTime} - ${sampleSlot.endTime}: PKR ${sampleSlot.price}`);
      }
      
      console.log('');
    });
    
    if (venuesWithoutTimeSlots.length === 0) {
      console.log('🎉 All venues have time slots configured!');
      return;
    }
    
    console.log(`⚠️  Found ${venuesWithoutTimeSlots.length} venues without time slots:`);
    venuesWithoutTimeSlots.forEach(venue => {
      console.log(`   - ${venue.name} (ID: ${venue.id})`);
    });
    
    // Generate and add time slots for venues that don't have them
    console.log('\n🔧 Generating time slots for venues without them...');
    
    for (const venue of venuesWithoutTimeSlots) {
      console.log(`\n🔄 Processing venue: ${venue.name}`);
      console.log(`   Base Price: PKR ${venue.basePrice}`);
      console.log(`   Operating Hours: ${venue.openTime} - ${venue.closeTime}`);
      
      // Generate time slots
      const timeSlots = generateTimeSlots(venue.basePrice, venue.openTime, venue.closeTime);
      console.log(`   Generated ${timeSlots.length} time slots`);
      
      // Update venue with time slots
      const venueRef = doc(db, 'venues', venue.id);
      await updateDoc(venueRef, {
        timeSlots: timeSlots,
        updatedAt: new Date()
      });
      
      console.log(`   ✅ Added time slots to ${venue.name}`);
    }
    
    console.log('\n🎉 Time slots generation completed!');
    
    // Verify the fix
    console.log('\n🔍 Verifying time slots were added...');
    for (const venue of venuesWithoutTimeSlots) {
      const venueRef = doc(db, 'venues', venue.id);
      const venueSnap = await getDoc(venueRef);
      
      if (venueSnap.exists()) {
        const updatedData = venueSnap.data();
        const timeSlots = updatedData.timeSlots || [];
        console.log(`✅ ${venue.name}: Now has ${timeSlots.length} time slots`);
        
        if (timeSlots.length > 0) {
          const sampleSlot = timeSlots[0];
          console.log(`   Sample: ${sampleSlot.time} - ${sampleSlot.endTime}: PKR ${sampleSlot.price}`);
        }
      }
    }
    
    console.log('\n💡 Mobile app should now show time slots for all venues!');
    
  } catch (error) {
    console.error('❌ Error debugging new venue time slots:', error);
  }
}

debugNewVenueTimeSlots();