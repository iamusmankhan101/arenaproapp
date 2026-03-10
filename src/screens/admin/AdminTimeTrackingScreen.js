import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Surface, ProgressBar, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import { format, isBefore, isAfter, parse } from 'date-fns';

export default function AdminTimeTrackingScreen() {
    const dispatch = useDispatch();
    const { dashboardStats, loading } = useSelector(state => state.admin);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        dispatch(fetchDashboardStats()).finally(() => {
            setRefreshing(false);
        });
    }, [dispatch]);

    const StatCard = ({ title, value, icon, color }) => (
        <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <MaterialIcons name={icon} size={24} color={color} />
                </View>
                <View style={styles.statText}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statTitle}>{title}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    const activeSessions = dashboardStats?.activeSessions || 0;
    const todayBookings = dashboardStats?.todayBookings || 0;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Time Tracking</Text>
                <Text style={styles.subtitle}>Monitor court usage and active sessions</Text>
            </View>

            <View style={styles.statsGrid}>
                <StatCard
                    title="Active Sessions"
                    value={activeSessions}
                    icon="flash-on"
                    color="#FF9800"
                />
                <StatCard
                    title="Today's Total Hours"
                    value={`${todayBookings * 1.5}h`} // Approximation for UI based on bookings
                    icon="timer"
                    color="#2196F3"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Live & Upcoming Sessions</Text>

                {dashboardStats?.todayBookingsList?.length > 0 ? (
                    dashboardStats.todayBookingsList.map((booking, index) => (
                        <Card key={index} style={[styles.bookingCard, booking.isLive && styles.liveCard]}>
                            <Card.Content>
                                <View style={styles.bookingHeader}>
                                    <Chip
                                        style={[styles.chip, booking.isLive ? styles.liveChip : styles.upcomingChip]}
                                        textStyle={booking.isLive ? styles.liveChipText : styles.upcomingChipText}
                                    >
                                        {booking.isLive ? 'LIVE' : 'UPCOMING'}
                                    </Chip>
                                    <Text style={styles.timeText}>{booking.timeSlot || format(new Date(booking.startTime || Date.now()), 'hh:mm a')}</Text>
                                </View>

                                <Text style={[styles.venueName, booking.isLive && { color: 'white' }]}>
                                    {booking.turfName || 'Venue'}
                                </Text>

                                <View style={styles.detailsRow}>
                                    <Text style={[styles.customerText, booking.isLive && { color: 'white' }]}>
                                        {booking.customerName} • {booking.sport}
                                    </Text>
                                    <View style={styles.durationBadge}>
                                        <MaterialIcons name="schedule" size={14} color={booking.isLive ? 'white' : '#666'} />
                                        <Text style={[styles.durationText, booking.isLive && { color: 'white' }]}>
                                            {booking.duration}h
                                        </Text>
                                    </View>
                                </View>

                                {booking.isLive && (
                                    <View style={styles.progressContainer}>
                                        <ProgressBar progress={0.5} color="#4CAF50" style={styles.progressBar} />
                                        <Text style={styles.progressText}>50% Complete</Text>
                                    </View>
                                )}
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    <Surface style={styles.emptyState}>
                        <MaterialIcons name="event-busy" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>No sessions scheduled today</Text>
                    </Surface>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 20, backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', fontFamily: 'Montserrat_700Bold' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 4, fontFamily: 'Montserrat_400Regular' },
    statsGrid: { flexDirection: 'row', padding: 16, gap: 12 },
    statCard: { flex: 1, backgroundColor: 'white' },
    statContent: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    statText: { flex: 1 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    statTitle: { fontSize: 12, color: '#666' },
    section: { padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
    bookingCard: { marginBottom: 12, backgroundColor: 'white' },
    liveCard: { backgroundColor: '#004d43' },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    chip: { height: 24 },
    liveChip: { backgroundColor: '#e8ee26' },
    upcomingChip: { backgroundColor: '#f0f0f0' },
    liveChipText: { color: '#004d43', fontSize: 10, fontWeight: 'bold' },
    upcomingChipText: { color: '#666', fontSize: 10, fontWeight: 'bold' },
    timeText: { fontSize: 12, color: '#999', fontWeight: 'bold' },
    venueName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    customerText: { fontSize: 14, color: '#666' },
    durationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    durationText: { fontSize: 12, color: '#666', marginLeft: 4, fontWeight: 'bold' },
    progressContainer: { marginTop: 16 },
    progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
    progressText: { color: 'white', fontSize: 10, marginTop: 4, textAlign: 'right', opacity: 0.8 },
    emptyState: { padding: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 12 },
    emptyStateText: { marginTop: 12, color: '#999', fontFamily: 'Montserrat_500Medium' }
});
