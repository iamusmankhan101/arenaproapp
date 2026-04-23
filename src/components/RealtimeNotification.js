import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const RealtimeNotification = ({ message, type = 'info', duration = 3000, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideNotification();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#2196F3';
    }
  };

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={[styles.card, { backgroundColor: getBackgroundColor() }]}>
        <View style={styles.content}>
          <MaterialIcons 
            name={getIconName()} 
            size={24} 
            color="white" 
            style={styles.icon}
          />
          <Text style={styles.message}>{String(message)}</Text>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  card: {
    elevation: 8,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RealtimeNotification;