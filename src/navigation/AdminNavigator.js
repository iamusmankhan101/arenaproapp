import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';
import AdminVenuesScreen from '../screens/admin/AdminVenuesScreen';
import AdminCustomersScreen from '../screens/admin/AdminCustomersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Bookings') {
            iconName = 'event-note';
          } else if (route.name === 'Venues') {
            iconName = 'location-on';
          } else if (route.name === 'Customers') {
            iconName = 'people';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Montserrat_700Bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={AdminBookingsScreen}
        options={{
          title: 'Manage Bookings',
        }}
      />
      <Tab.Screen 
        name="Venues" 
        component={AdminVenuesScreen}
        options={{
          title: 'Manage Venues',
        }}
      />
      <Tab.Screen 
        name="Customers" 
        component={AdminCustomersScreen}
        options={{
          title: 'Manage Customers',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Montserrat_700Bold',
        },
      }}
    >
      <Stack.Screen 
        name="AdminTabs" 
        component={AdminTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Additional Admin Screens */}
      <Stack.Screen 
        name="BookingDetail" 
        component={AdminDashboardScreen} // Placeholder
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen 
        name="VenueDetail" 
        component={AdminDashboardScreen} // Placeholder
        options={{ title: 'Venue Details' }}
      />
      <Stack.Screen 
        name="CustomerDetail" 
        component={AdminDashboardScreen} // Placeholder
        options={{ title: 'Customer Details' }}
      />
      <Stack.Screen 
        name="AddVenue" 
        component={AdminDashboardScreen} // Placeholder
        options={{ title: 'Add New Venue' }}
      />
      <Stack.Screen 
        name="EditVenue" 
        component={AdminDashboardScreen} // Placeholder
        options={{ title: 'Edit Venue' }}
      />
      <Stack.Screen 
        name="AddBooking" 
        component={AdminDashboardScreen} // Placeholder
        options={{ title: 'Add Manual Booking' }}
      />
      <Stack.Screen 
        name="AdminReports" 
        component={AdminDashboardScreen} // Placeholder
        options={{ title: 'Reports & Analytics' }}
      />
      <Stack.Screen 
        name="AdminRevenue" 
        component={AdminDashboardScreen} // Placeholder
        options={{ title: 'Revenue Analytics' }}
      />
    </Stack.Navigator>
  );
}