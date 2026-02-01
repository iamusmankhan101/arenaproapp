import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, Chip, Menu, ProgressBar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminVenueCard({ venue, onAction, onPress }) {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const getStatusColor = (status) => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  const getStatusBgColor = (status) => {
    return status === 'active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
  };

  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'cricket': return 'sports-cricket';
      case 'football': return 'sports-soccer';
      case 'padel': return 'sports-tennis';
      default: return 'sports';
    }
  };

  const getSportColor = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'cricket': return '#FF6B35';
      case 'football': return '#4CAF50';
      case 'padel': return '#2196F3';
      default: return '#666';
    }
  };

  const occupancyRate = (venue.bookedSlots / venue.totalSlots) * 100;

  return (
    <Surface style={styles.card} elevation={2}>
      <TouchableOpacity onPress={onPress} style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <Text style={styles.venueLocation}>{venue.area}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusBgColor(venue.status) }]}
              textStyle={[styles.statusText, { color: getStatusColor(venue.status) }]}
            >
              {venue.status.toUpperCase()}
            </Chip>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                >
                  <MaterialIcons name="more-vert" size={20} color="#666" />
                </TouchableOpacity>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onAction(venue.id, 'edit');
                }} 
                title="Edit Venue" 
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onAction(venue.id, 'toggle');
                }} 
                title={venue.status === 'active' ? 'Deactivate' : 'Activate'} 
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onAction(venue.id, 'analytics');
                }} 
                title="View Analytics" 
              />
            </Menu>
          </View>
        </View>

        {/* Sports */}
        <View style={styles.sportsSection}>
          {venue.sports.map((sport, index) => (
            <View key={index} style={styles.sportChip}>
              <MaterialIcons 
                name={getSportIcon(sport)} 
                size={14} 
                color={getSportColor(sport)} 
              />
              <Text style={[styles.sportText, { color: getSportColor(sport) }]}>
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{venue.rating}</Text>
            <Text style={styles.statLabel}>({venue.totalReviews})</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.statValue}>{venue.bookedSlots}/{venue.totalSlots}</Text>
            <Text style={styles.statLabel}>Slots</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="payments" size={16} color="#4CAF50" />
            <Text style={styles.statValue}>PKR {venue.priceRange}</Text>
            <Text style={styles.statLabel}>Range</Text>
          </View>
        </View>

        {/* Occupancy Rate */}
        <View style={styles.occupancySection}>
          <View style={styles.occupancyHeader}>
            <Text style={styles.occupancyLabel}>Occupancy Rate</Text>
            <Text style={styles.occupancyValue}>{occupancyRate.toFixed(0)}%</Text>
          </View>
          <ProgressBar 
            progress={occupancyRate / 100} 
            color={occupancyRate > 80 ? '#4CAF50' : occupancyRate > 50 ? '#FF9800' : '#F44336'}
            style={styles.progressBar}
          />
        </View>

        {/* Revenue */}
        <View style={styles.revenueSection}>
          <MaterialIcons name="trending-up" size={16} color="#4CAF50" />
          <Text style={styles.revenueText}>
            Monthly Revenue: PKR {venue.revenue.toLocaleString()}
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactItem}>
            <MaterialIcons name="person" size={14} color="#666" />
            <Text style={styles.contactText}>{venue.contactPerson}</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>{venue.contactPhone}</Text>
          </View>
        </View>

        {/* Facilities */}
        <View style={styles.facilitiesSection}>
          <Text style={styles.facilitiesLabel}>Facilities:</Text>
          <View style={styles.facilitiesContainer}>
            {venue.facilities.slice(0, 3).map((facility, index) => (
              <Chip key={index} style={styles.facilityChip} textStyle={styles.facilityText}>
                {facility}
              </Chip>
            ))}
            {venue.facilities.length > 3 && (
              <Text style={styles.moreFacilities}>+{venue.facilities.length - 3} more</Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            compact
            style={styles.actionButton}
            onPress={() => onAction(venue.id, 'edit')}
          >
            Edit
          </Button>
          <Button
            mode="contained"
            buttonColor={venue.status === 'active' ? '#F44336' : '#4CAF50'}
            compact
            style={styles.actionButton}
            onPress={() => onAction(venue.id, 'toggle')}
          >
            {venue.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </View>
      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  venueLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  menuButton: {
    padding: 4,
  },
  sportsSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  sportText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  occupancySection: {
    marginBottom: 12,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  occupancyLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  occupancyValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  revenueSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  revenueText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  facilitiesSection: {
    marginBottom: 12,
  },
  facilitiesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'Montserrat_500Medium',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  facilityChip: {
    height: 20,
    backgroundColor: '#f0f0f0',
  },
  facilityText: {
    fontSize: 9,
    fontFamily: 'Montserrat_400Regular',
  },
  moreFacilities: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    fontFamily: 'Montserrat_400Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
});