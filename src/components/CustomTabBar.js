import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    
    return (
        <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
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
                else if (route.name === 'SquadBuilder') iconName = 'group-add';
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
                            isFocused && styles.activeTabButton
                        ]}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons
                            name={iconName}
                            size={28}
                            color={isFocused ? '#e8ee26' : '#004d43'}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        height: 70,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        borderRadius: 25,
    },
    activeTabButton: {
        backgroundColor: '#004d43',
    },
});
