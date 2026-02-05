import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.tabBarContainer}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                // Get icon name based on route
                let iconName = 'home';
                if (route.name === 'Home') iconName = 'home';
                else if (route.name === 'Map') iconName = 'map';
                else if (route.name === 'Bookings') iconName = 'event';
                else if (route.name === 'Lalkaar') iconName = 'sports-soccer';
                else if (route.name === 'Profile') iconName = 'person';

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        // Animate Layout Change
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={[
                            styles.tabButton,
                            { flex: isFocused ? 2.5 : 1 }, // Give more space to active tab
                            isFocused && styles.activeTabButton
                        ]}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons
                            name={iconName}
                            size={24}
                            color={isFocused ? '#e8ee26' : '#004d43'}
                        />
                        {isFocused && (
                            <Text style={styles.activeLabel} numberOfLines={1}>{label}</Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        height: 65,
        alignItems: 'center',
        justifyContent: 'space-between', // Changed from space-around for better spacing control
        paddingHorizontal: 5, // Reduced padding
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 24,
        paddingHorizontal: 4, // Minimal padding for inactive
    },
    activeTabButton: {
        backgroundColor: '#004d43',
        flexDirection: 'row',
        paddingHorizontal: 16, // Reduced from 20 to save space
    },
    activeLabel: {
        fontSize: 13, // Slightly reduced font size
        fontWeight: '600',
        color: '#e8ee26',
        marginLeft: 6, // Reduced margin
    },
});
