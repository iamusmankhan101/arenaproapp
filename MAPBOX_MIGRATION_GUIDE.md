# 🗺️ Migrate from Google Maps to Mapbox

## Why Mapbox?

Mapbox offers several advantages over Google Maps:

✅ **Free tier**: 50,000 free map loads per month (vs Google's limited free tier)
✅ **Better customization**: More control over map styling
✅ **No API key crashes**: More forgiving with missing/invalid keys
✅ **Better performance**: Lighter weight and faster rendering
✅ **Offline maps**: Support for offline map tiles
✅ **No billing surprises**: Predictable pricing

## Migration Steps

### Step 1: Get Mapbox Access Token

1. Go to [Mapbox](https://www.mapbox.com/)
2. Sign up for a free account
3. Go to your [Account page](https://account.mapbox.com/)
4. Copy your **Default public token** (starts with `pk.`)

### Step 2: Install Mapbox Package

```bash
npx expo install @rnmapbox/maps
```

### Step 3: Configure app.json

Replace the Google Maps configuration with Mapbox:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyByv8v58hZXCf-uvvVOCbPAS5VKI9C7Co8"
        }
      }
    },
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": "YOUR_MAPBOX_SECRET_TOKEN",
          "RNMapboxMapsVersion": "11.0.0"
        }
      ]
    ]
  }
}
```

**Note**: You can keep both Google Maps and Mapbox configurations if you want to support both.

### Step 4: Update MapScreen.js

Here's the minimal code change needed:

#### Old (Google Maps):
```javascript
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';

<MapView
  ref={mapRef}
  provider={PROVIDER_GOOGLE}
  style={styles.map}
  initialRegion={initialRegion}
  customMapStyle={customMapStyle}
>
  <Marker coordinate={{ latitude, longitude }} />
</MapView>
```

#### New (Mapbox):
```javascript
import Mapbox from '@rnmapbox/maps';

// Initialize Mapbox (add this before your component)
Mapbox.setAccessToken('YOUR_MAPBOX_PUBLIC_TOKEN');

<Mapbox.MapView
  ref={mapRef}
  style={styles.map}
  styleURL={Mapbox.StyleURL.Street} // or Light, Dark, Satellite, etc.
>
  <Mapbox.Camera
    zoomLevel={14}
    centerCoordinate={[longitude, latitude]}
    animationMode="flyTo"
    animationDuration={1000}
  />
  
  <Mapbox.PointAnnotation
    id="marker"
    coordinate={[longitude, latitude]}
  />
</Mapbox.MapView>
```

### Step 5: Key Differences

| Feature | Google Maps | Mapbox |
|---------|-------------|--------|
| **Coordinates** | `{ latitude, longitude }` | `[longitude, latitude]` ⚠️ |
| **Map Component** | `<MapView>` | `<Mapbox.MapView>` |
| **Markers** | `<Marker>` | `<Mapbox.PointAnnotation>` |
| **Camera** | `initialRegion` prop | `<Mapbox.Camera>` component |
| **Circles** | `<Circle>` | `<Mapbox.CircleLayer>` |
| **Styling** | `customMapStyle` prop | `styleURL` prop |

⚠️ **IMPORTANT**: Mapbox uses `[longitude, latitude]` order (opposite of Google Maps)!

### Step 6: Complete MapScreen Migration

I can create a complete Mapbox version of your MapScreen. Here's what changes:

1. **Import changes**:
```javascript
// Remove:
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';

// Add:
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken('YOUR_MAPBOX_PUBLIC_TOKEN');
```

2. **Map component**:
```javascript
<Mapbox.MapView
  ref={mapRef}
  style={styles.map}
  styleURL={Mapbox.StyleURL.Street}
  onDidFinishLoadingMap={handleMapReady}
>
  {/* Camera for controlling view */}
  <Mapbox.Camera
    ref={cameraRef}
    zoomLevel={14}
    centerCoordinate={[region.longitude, region.latitude]}
    animationMode="flyTo"
    animationDuration={1000}
  />

  {/* User location circle */}
  {location && (
    <Mapbox.CircleLayer
      id="userLocationCircle"
      sourceID="userLocationSource"
      style={{
        circleRadius: 2000 / Math.cos(location.latitude * Math.PI / 180) / 0.075,
        circleColor: 'rgba(232, 238, 38, 0.15)',
        circleStrokeWidth: 2,
        circleStrokeColor: '#e8ee26',
      }}
    />
  )}

  {/* User location marker */}
  {location && (
    <Mapbox.PointAnnotation
      id="userLocation"
      coordinate={[location.longitude, location.latitude]}
    >
      <View style={styles.userLocationMarker}>
        <View style={styles.userLocationDot} />
      </View>
    </Mapbox.PointAnnotation>
  )}

  {/* Venue markers */}
  {filteredVenues.map((venue, index) => {
    const coordinates = venue.coordinates || getVenueCoordinatesSync(venue);
    if (!coordinates.isValid) return null;

    return (
      <Mapbox.PointAnnotation
        key={`venue-${venue.id}-${index}`}
        id={`venue-${venue.id}`}
        coordinate={[coordinates.longitude, coordinates.latitude]}
        onSelected={() => handleMarkerPress(venue)}
      >
        <View style={[
          styles.dotMarker,
          selectedVenue?.id === venue.id && styles.selectedMarkerContainer
        ]}>
          {selectedVenue?.id === venue.id ? (
            <View style={styles.selectedMarkerOuter}>
              <View style={styles.selectedMarkerInner}>
                <MaterialIcons name="navigation" size={16} color="white" />
              </View>
            </View>
          ) : (
            <View style={styles.markerDot} />
          )}
        </View>
      </Mapbox.PointAnnotation>
    );
  })}
</Mapbox.MapView>
```

3. **Camera control functions**:
```javascript
const cameraRef = useRef(null);

const centerOnUserLocation = () => {
  if (location && cameraRef.current) {
    cameraRef.current.setCamera({
      centerCoordinate: [location.longitude, location.latitude],
      zoomLevel: 14,
      animationDuration: 1000,
    });
  }
};

const zoomToFitMarkers = (venues = filteredVenues) => {
  if (cameraRef.current && venues.length > 0) {
    const coordinates = venues
      .map(venue => {
        const coords = venue.coordinates || getVenueCoordinatesSync(venue);
        return coords.isValid ? [coords.longitude, coords.latitude] : null;
      })
      .filter(coord => coord !== null);

    if (coordinates.length > 0) {
      cameraRef.current.fitBounds(
        coordinates[0], // northeast
        coordinates[coordinates.length - 1], // southwest
        [50, 200, 200, 50], // padding [top, right, bottom, left]
        1000 // animation duration
      );
    }
  }
};
```

## Comparison: Google Maps vs Mapbox

### Pros of Mapbox:
- ✅ More generous free tier (50k loads/month)
- ✅ Better customization and styling
- ✅ Offline map support
- ✅ Better performance
- ✅ No sudden API key crashes
- ✅ More predictable pricing

### Pros of Google Maps:
- ✅ More familiar to users
- ✅ Better POI (Points of Interest) data
- ✅ Street View integration
- ✅ Better geocoding accuracy in some regions

## Recommendation

For your Arena Pro app, I recommend:

1. **Try Mapbox first** - It's free for your usage level and solves the API key crash issue
2. **Keep it simple** - Mapbox has a cleaner API and better documentation
3. **Test thoroughly** - Make sure all features work (markers, user location, etc.)

## Quick Start: Mapbox Setup

Want me to create a complete Mapbox version of your MapScreen? I can:

1. ✅ Create `MapScreenMapbox.js` with full Mapbox implementation
2. ✅ Keep your existing `MapScreen.js` as backup
3. ✅ Add a toggle to switch between Google Maps and Mapbox
4. ✅ Update `app.json` with Mapbox configuration

Just say "migrate to mapbox" and I'll do it all for you!

## Cost Comparison

### Google Maps Pricing:
- First 28,000 loads: FREE
- After that: $7 per 1,000 loads
- **Your estimated cost**: If you have 1,000 users opening the map 5 times/day = 150,000 loads/month = ~$850/month

### Mapbox Pricing:
- First 50,000 loads: FREE
- After that: $5 per 1,000 loads
- **Your estimated cost**: Same usage = $500/month (41% cheaper)

## Next Steps

1. **Get Mapbox token**: Sign up at mapbox.com
2. **Test in development**: Install and test Mapbox
3. **Compare**: See which works
