import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';

export default function SlotMatrix({ slots, onSlotSelect, selectedDate, onDateChange }) {
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const getSlotStatus = (time) => {
    const slot = slots.find(s => s.startTime === time);
    if (!slot) return 'maintenance';
    return slot.status; // 'available', 'booked', 'maintenance'
  };

  const getSlotColor = (status) => {
    switch (status) {
      case 'available': return '#4CAF50'; // Green
      case 'booked': return '#F44336'; // Red
      case 'maintenance': return '#9E9E9E'; // Grey
      default: return '#9E9E9E';
    }
  };

  const getSlotPrice = (time) => {
    const hour = parseInt(time.split(':')[0]);
    
    // Prime Time: 8 PM - 12 AM (20-23)
    if (hour >= 20 && hour <= 23) {
      return { price: 3500, type: 'Prime Time' };
    }
    
    // Happy Hours: 4 PM - 7 PM (16-19)
    if (hour >= 16 && hour <= 19) {
      return { price: 2000, type: 'Happy Hours' };
    }
    
    // Regular hours
    return { price: 2500, type: 'Regular' };
  };

  const handleSlotPress = (time) => {
    const status = getSlotStatus(time);
    if (status === 'available') {
      const priceInfo = getSlotPrice(time);
      onSlotSelect({
        startTime: time,
        endTime: `${parseInt(time.split(':')[0]) + 1}:00`,
        price: priceInfo.price,
        priceType: priceInfo.type,
        date: selectedDate,
      });
    }
  };

  const getNextDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  return (
    <View style={styles.container}>
      {/* Date Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {getNextDates().map(({ date, label }) => (
          <Chip
            key={date}
            selected={date === selectedDate}
            onPress={() => onDateChange(date)}
            style={[
              styles.dateChip,
              date === selectedDate && styles.selectedDateChip
            ]}
          >
            {label}
          </Chip>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#9E9E9E' }]} />
          <Text style={styles.legendText}>Maintenance</Text>
        </View>
      </View>

      {/* Time Slots Grid */}
      <View style={styles.slotsGrid}>
        {timeSlots.map((time) => {
          const status = getSlotStatus(time);
          const priceInfo = getSlotPrice(time);
          const isAvailable = status === 'available';
          
          return (
            <Button
              key={time}
              mode={isAvailable ? 'contained' : 'outlined'}
              onPress={() => handleSlotPress(time)}
              disabled={!isAvailable}
              style={[
                styles.slotButton,
                { backgroundColor: isAvailable ? getSlotColor(status) : '#F5F5F5' }
              ]}
              labelStyle={[
                styles.slotButtonText,
                { color: isAvailable ? 'white' : '#999' }
              ]}
            >
              <View style={styles.slotContent}>
                <Text style={[styles.timeText, { color: isAvailable ? 'white' : '#999' }]}>
                  {time}
                </Text>
                {isAvailable && (
                  <>
                    <Text style={[styles.priceText, { color: 'white' }]}>
                      Rs. {priceInfo.price}
                    </Text>
                    <Text style={[styles.typeText, { color: 'rgba(255,255,255,0.8)' }]}>
                      {priceInfo.type}
                    </Text>
                  </>
                )}
                {status === 'booked' && (
                  <Text style={[styles.statusText, { color: '#999' }]}>
                    Booked
                  </Text>
                )}
              </View>
            </Button>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateScroll: {
    marginBottom: 15,
  },
  dateChip: {
    marginRight: 8,
  },
  selectedDateChip: {
    backgroundColor: '#2E7D32',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotButton: {
    width: '48%',
    marginBottom: 10,
    minHeight: 80,
  },
  slotContent: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  typeText: {
    fontSize: 10,
    marginTop: 1,
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
});