import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

console.log('🔧 Fixing Time Slots Structure for Mobile App Compatibility...');

async function fixTimeSlotsStructure() {
  try {
    // Get all venues
    console.log('📋 Fetching all venues...');
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    if (snapshot.empty) {
      console.log('❌ No venues found in database');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} venues to check\n`);
    
    let fixedCount = 0;
    
    // Process each venue
    for (const venueDoc of snapshot.docs) {
      const venueData = venueDoc.data();
      const venueId = venueDoc.id;
      
      console.log(`🏟️ Processing venue: ${venueData.name} (ID: ${venueId})`);
      
      if (!venueData.timeSlots || venueData.timeSlots.length === 0) {
        console.log('   ⚠️  No time slots found, skipping...');
        continue;
      }
      
      // Check if time slots need fixing
      let needsFixing = false;
      const fixedTimeSlots = venueData.timeSlots.map(slot => {
        const fixedSlot = { ...slot };
        
        // Ensure both 'time' and 'startTime' fields exist for compatibility
        if (slot.startTime && !slot.time) {
          fixedSlot.time = slot.startTime;
          needsFixing = true;
        } else if (slot.time && !slot.startTime) {
          fixedSlot.startTime = slot.time;
          needsFixing = true;
        }
        
        // Ensure required fields exist
        if (!fixedSlot.id) {
          fixedSlot.id = `slot-${fixedSlot.time || fixedSlot.startTime}`;
          needsFixing = true;
        }
        
        if (fixedSlot.available === undefined) {
          fixedSlot.available = true;
          needsFixing = true;
        }
        
        // Remove any unwanted fields that might cause issues
        delete fixedSlot.selected; // Remove admin panel specific field
        
        return fixedSlot;
      });
      
      if (needsFixing) {
        console.log(`   🔧 Fixing time slots structure...`);
        
        // Update venue with fixed time slots
        const venueRef = doc(db, 'venues', venueId);
        await updateDoc(venueRef, {
          timeSlots: fixedTimeSlots,
          updatedAt: new Date()
        });
        
        console.log(`   ✅ Fixed ${fixedTimeSlots.length} time slots`);
        fixedCount++;
      } else {
        console.log(`   ✅ Time slots structure already correct`);
      }
      
      // Show sample of fixed structure
      const sampleSlot = fixedTimeSlots[0];
      console.log(`   📋 Sample slot: ${sampleSlot.time} - ${sampleSlot.endTime}: PKR ${sampleSlot.price}`);
      console.log('');
    }
    
    console.log(`🎉 Time slots structure fix completed!`);
    console.log(`📊 Fixed ${fixedCount} venues`);
    console.log(`💡 Mobile app should now display time slots correctly`);
    
    // Test the fix
    console.log('\n🧪 Testing mobile app compatibility...');
    const testVenue = snapshot.docs[0];
    const testVenueData = testVenue.data();
    
    if (testVenueData.timeSlots && testVenueData.timeSlots.length > 0) {
      const testSlot = testVenueData.timeSlots[0];
      console.log('✅ Test slot structure:');
      console.log(`   - Has 'time' field: ${!!testSlot.time}`);
      console.log(`   - Has 'startTime' field: ${!!testSlot.startTime}`);
      console.log(`   - Has 'endTime' field: ${!!testSlot.endTime}`);
      console.log(`   - Has 'price' field: ${!!testSlot.price}`);
      console.log(`   - Has 'available' field: ${!!testSlot.available}`);
      console.log(`   - Has 'id' field: ${!!testSlot.id}`);
      
      if (testSlot.time && testSlot.startTime && testSlot.endTime && testSlot.price) {
        console.log('🎯 Mobile app compatibility: EXCELLENT');
      } else {
        console.log('⚠️  Mobile app compatibility: NEEDS MORE WORK');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing time slots structure:', error);
  }
}

fixTimeSlotsStructure();