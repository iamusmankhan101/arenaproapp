const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugTimeslotDiscount() {
  console.log('🔍 DEBUG: Checking venue discount data...\n');

  try {
    // Get the venue that's showing in the screenshot (appears to be "Ringer")
    const venuesSnapshot = await db.collection('venues')
      .where('name', '==', 'Ringer')
      .limit(1)
      .get();

    if (venuesSnapshot.empty) {
      console.log('❌ Venue "Ringer" not found. Checking all venues...\n');
      
      // Get all venues to see their discount structure
      const allVenuesSnapshot = await db.collection('venues').limit(5).get();
      
      allVenuesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`📍 Venue: ${data.name}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Has discount field: ${!!data.discount}`);
        console.log(`   Has discountPercentage field: ${!!data.discountPercentage}`);
        console.log(`   discount value: ${data.discount || 'N/A'}`);
        console.log(`   discountPercentage value: ${data.discountPercentage || 'N/A'}`);
        console.log(`   pricePerHour: ${data.pricePerHour || 'N/A'}`);
        console.log(`   pricing.basePrice: ${data.pricing?.basePrice || 'N/A'}`);
        console.log('');
      });
      
      return;
    }

    const venueDoc = venuesSnapshot.docs[0];
    const venueData = venueDoc.data();

    console.log('✅ Found venue: Ringer');
    console.log(`   ID: ${venueDoc.id}`);
    console.log('');

    console.log('📊 Discount Information:');
    console.log(`   Has 'discount' field: ${!!venueData.discount}`);
    console.log(`   Has 'discountPercentage' field: ${!!venueData.discountPercentage}`);
    console.log(`   discount value: ${venueData.discount || 'N/A'}`);
    console.log(`   discountPercentage value: ${venueData.discountPercentage || 'N/A'}`);
    console.log('');

    console.log('💰 Pricing Information:');
    console.log(`   pricePerHour: ${venueData.pricePerHour || 'N/A'}`);
    console.log(`   pricing.basePrice: ${venueData.pricing?.basePrice || 'N/A'}`);
    console.log(`   priceFrom: ${venueData.priceFrom || 'N/A'}`);
    console.log('');

    console.log('🕐 Time Slots Sample:');
    if (venueData.timeSlots && venueData.timeSlots.length > 0) {
      const sampleSlots = venueData.timeSlots.slice(0, 3);
      sampleSlots.forEach((slot, index) => {
        console.log(`   ${index + 1}. ${slot.time || slot.startTime} - ${slot.endTime}`);
        console.log(`      Price: PKR ${slot.price}`);
        console.log(`      Has discount applied: ${slot.discountedPrice ? 'Yes' : 'No'}`);
        if (slot.discountedPrice) {
          console.log(`      Discounted Price: PKR ${slot.discountedPrice}`);
        }
      });
    } else {
      console.log('   No time slots found');
    }
    console.log('');

    // Calculate what the discount should be
    if (venueData.discount || venueData.discountPercentage) {
      const discountValue = venueData.discountPercentage || venueData.discount;
      const basePrice = venueData.pricePerHour || venueData.pricing?.basePrice || 2000;
      const discountedPrice = Math.round(basePrice * (1 - discountValue / 100));
      
      console.log('🧮 Calculated Discount:');
      console.log(`   Base Price: PKR ${basePrice}`);
      console.log(`   Discount: ${discountValue}%`);
      console.log(`   Discounted Price: PKR ${discountedPrice}`);
      console.log(`   Savings: PKR ${basePrice - discountedPrice}`);
      console.log('');
    }

    // Check if discount needs to be added
    if (!venueData.discount && !venueData.discountPercentage) {
      console.log('⚠️  ISSUE FOUND: Venue has no discount field!');
      console.log('');
      console.log('💡 SOLUTION: Add discount field to venue document');
      console.log('   Example: discount: 15 (for 15% off)');
      console.log('   Or: discountPercentage: 15');
      console.log('');
      
      // Offer to add discount
      console.log('Would you like to add a 15% discount to this venue?');
      console.log('Run: node add-venue-discount.js');
    } else {
      console.log('✅ Venue has discount configured correctly');
      console.log('');
      console.log('🔍 Checking mobile app logic...');
      console.log('   The discount should be applied in TurfDetailScreen');
      console.log('   Check if hasDiscount(venue) returns true');
      console.log('   Check if getDiscountValue(venue) returns the correct value');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

debugTimeslotDiscount();
