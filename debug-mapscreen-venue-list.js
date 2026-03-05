const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "arena-pro-app",
      clientEmail: "firebase-adminsdk-rvqxo@arena-pro-app.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCqJxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\nxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n')
    }),
    databaseURL: "https://arena-pro-app.firebaseio.com"
  });
}

const db = admin.firestore();

async function debugMapScreenVenueList() {
  console.log('🔍 DEBUG: MapScreen Venue List Issue\n');
  console.log('=' .repeat(60));

  try {
    // Fetch venues from Firestore
    const venuesSnapshot = await db.collection('venues').get();
    console.log(`\n📊 Total venues in Firestore: ${venuesSnapshot.size}`);

    if (venuesSnapshot.empty) {
      console.log('❌ No venues found in Firestore!');
      return;
    }

    const venues = [];
    venuesSnapshot.forEach(doc => {
      venues.push({ id: doc.id, ...doc.data() });
    });

    console.log('\n✅ Venues fetched successfully\n');

    // Check coordinate validity
    let validCoords = 0;
    let invalidCoords = 0;

    venues.forEach((venue, index) => {
      const hasDirectCoords = venue.latitude && venue.longitude;
      const hasLocationCoords = venue.location?.latitude && venue.location?.longitude;
      
      if (hasDirectCoords || hasLocationCoords) {
        validCoords++;
        if (index < 3) { // Show first 3 venues
          console.log(`✅ Venue ${index + 1}: ${venue.name}`);
          console.log(`   Coordinates: ${hasDirectCoords ? `${venue.latitude}, ${venue.longitude}` : `${venue.location.latitude}, ${venue.location.longitude}`}`);
          console.log(`   Image: ${venue.images?.[0] ? 'Yes' : 'No'}`);
          console.log(`   Price: Rs. ${venue.pricePerHour || venue.pricing?.basePrice || 0}/hr`);
          console.log(`   Rating: ${venue.rating || 5.0}`);
          console.log('');
        }
      } else {
        invalidCoords++;
        console.log(`❌ Venue ${index + 1}: ${venue.name} - NO VALID COORDINATES`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`📍 Venues with valid coordinates: ${validCoords}`);
    console.log(`❌ Venues without valid coordinates: ${invalidCoords}`);
    console.log('='.repeat(60));

    // Check if venues have required fields for display
    console.log('\n📋 Checking required fields for venue list display:\n');
    
    const firstVenue = venues[0];
    console.log('Sample venue data structure:');
    console.log(`- ID: ${firstVenue.id ? '✅' : '❌'}`);
    console.log(`- Name: ${firstVenue.name ? '✅' : '❌'}`);
    console.log(`- Images: ${firstVenue.images?.length > 0 ? '✅' : '❌'}`);
    console.log(`- Rating: ${firstVenue.rating ? '✅' : '❌'}`);
    console.log(`- Price: ${firstVenue.pricePerHour || firstVenue.pricing?.basePrice ? '✅' : '❌'}`);
    console.log(`- Coordinates: ${(firstVenue.latitude && firstVenue.longitude) || (firstVenue.location?.latitude && firstVenue.location?.longitude) ? '✅' : '❌'}`);

    console.log('\n✅ Debug complete!');
    console.log('\nNEXT STEPS:');
    console.log('1. Check if venues are being fetched in the app (check Redux state)');
    console.log('2. Verify nearbyTurfs array is populated');
    console.log('3. Check if processVenuesCoordinates is filtering correctly');
    console.log('4. Verify filteredVenues state is being set');

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

debugMapScreenVenueList();
