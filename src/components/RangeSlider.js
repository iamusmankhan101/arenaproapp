import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 80; // Adjusted for padding
const HANDLE_SIZE = 24;

export default function RangeSlider({ min, max, step, initialRange, onRangeChange }) {
    const [low, setLow] = useState(initialRange[0] || 0);
    const [high, setHigh] = useState(initialRange[1] || max);

    const lowAnim = useRef(new Animated.Value(((initialRange[0] || 0) / max) * SLIDER_WIDTH)).current;
    const highAnim = useRef(new Animated.Value(((initialRange[1] || max) / max) * SLIDER_WIDTH)).current;

    const lowRef = useRef(initialRange[0] || 0);
    const highRef = useRef(initialRange[1] || max);
    const startLowRef = useRef(initialRange[0] || 0);
    const startHighRef = useRef(initialRange[1] || max);

    useEffect(() => {
        lowRef.current = initialRange[0];
        highRef.current = initialRange[1];
        startLowRef.current = initialRange[0];
        startHighRef.current = initialRange[1];
        setLow(initialRange[0]);
        setHigh(initialRange[1]);
        lowAnim.setValue((initialRange[0] / max) * SLIDER_WIDTH);
        highAnim.setValue((initialRange[1] / max) * SLIDER_WIDTH);
    }, [initialRange, max, lowAnim, highAnim]);

    const panResponderLow = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                startLowRef.current = lowRef.current;
            },
            onPanResponderMove: (evt, gestureState) => {
                let newX = (startLowRef.current / max) * SLIDER_WIDTH + gestureState.dx;
                newX = Math.max(0, Math.min(newX, (highRef.current / max) * SLIDER_WIDTH - 20));

                const newValue = Math.round((newX / SLIDER_WIDTH) * max / step) * step;
                const validValue = Number.isFinite(newValue) ? Math.max(min, Math.min(newValue, highRef.current)) : min;
                lowRef.current = validValue;
                setLow(validValue);
                lowAnim.setValue(newX);
            },
            onPanResponderRelease: () => {
                onRangeChange([lowRef.current, highRef.current]);
            }
        })
    ).current;

    const panResponderHigh = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                startHighRef.current = highRef.current;
            },
            onPanResponderMove: (evt, gestureState) => {
                let newX = (startHighRef.current / max) * SLIDER_WIDTH + gestureState.dx;
                newX = Math.max((lowRef.current / max) * SLIDER_WIDTH + 20, Math.min(newX, SLIDER_WIDTH));

                const newValue = Math.round((newX / SLIDER_WIDTH) * max / step) * step;
                const validValue = Number.isFinite(newValue) ? Math.max(lowRef.current, Math.min(newValue, max)) : max;
                highRef.current = validValue;
                setHigh(validValue);
                highAnim.setValue(newX);
            },
            onPanResponderRelease: () => {
                onRangeChange([lowRef.current, highRef.current]);
            }
        })
    ).current;

    return (
        <View style={styles.container}>
            <View style={styles.trackContainer}>
                <View style={styles.track} />
                <Animated.View
                    style={[
                        styles.activeTrack,
                        {
                            left: lowAnim,
                            width: Animated.subtract(highAnim, lowAnim)
                        }
                    ]}
                />

                <Animated.View
                    {...panResponderLow.panHandlers}
                    style={[styles.handle, { transform: [{ translateX: Animated.subtract(lowAnim, HANDLE_SIZE / 2) }] }]}
                >
                    <View style={styles.handleInner} />
                </Animated.View>

                <Animated.View
                    {...panResponderHigh.panHandlers}
                    style={[styles.handle, { transform: [{ translateX: Animated.subtract(highAnim, HANDLE_SIZE / 2) }] }]}
                >
                    <View style={styles.handleInner} />
                </Animated.View>
            </View>

            <View style={styles.labelRow}>
                <Text style={styles.labelText}>PKR {Number.isFinite(low) ? Math.round(low) : 0}</Text>
                <Text style={styles.labelText}>PKR {Number.isFinite(high) ? Math.round(high) : max}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        width: '100%',
    },
    trackContainer: {
        height: 30,
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        width: SLIDER_WIDTH,
    },
    activeTrack: {
        position: 'absolute',
        height: 4,
        backgroundColor: '#004d43',
        borderRadius: 2,
    },
    handle: {
        position: 'absolute',
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        borderRadius: HANDLE_SIZE / 2,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#004d43',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    handleInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e8ee26',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    labelText: {
        fontSize: 14,
        color: '#004d43',
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
    },
});
