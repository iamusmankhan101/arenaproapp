import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Surface, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import { format } from 'date-fns';

export default function AdminRevenueScreen() {
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

    const StatCard = ({ title, value, subtitle, icon, color }) => (
        <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                        <MaterialIcons name={icon} size={24} color={color} />
                    </View>
                    {subtitle && (
                        <Surface style={styles.badge}>
                            <Text style={styles.badgeText}>{subtitle}</Text>
                        </Surface>
                    )}
                </View>
                <TypographyValue>{value}</TypographyValue>
                <TypographyTitle>{title}</TypographyTitle>
            </Card.Content>
        </Card>
    );

    const TypographyValue = ({ children }) => <Text style={styles.statValue}>{children}</Text>;
    const TypographyTitle = ({ children }) => <Text style={styles.statTitle}>{children}</Text>;

    const totalRevenue = dashboardStats?.totalRevenue || 0;
    const todayRevenue = (dashboardStats?.todayBookings || 0) * 1500; // Mock calculation for today

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Revenue Management</Text>
                <Text style={styles.subtitle}>Track earnings and pricing performance</Text>
            </View>

            <View style={styles.statsGrid}>
                <StatCard
                    title="Total Revenue"
                    value={`PKR ${totalRevenue.toLocaleString()}`}
                    subtitle="All time"
                    icon="account-balance-wallet"
                    color="#4CAF50"
                />
                <StatCard
                    title="Today's Earnings"
                    value={`PKR ${todayRevenue.toLocaleString()}`}
                    subtitle="+12% vs avg"
                    icon="trending-up"
                    color="#00BCD4"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>

                <Card style={styles.transactionsCard}>
                    <Card.Content style={{ padding: 0 }}>
                        {dashboardStats?.recentActivity?.filter(a => a.type === 'booking').slice(0, 5).map((activity, index) => (
                            <View key={index} style={[styles.transactionItem, index > 0 && styles.borderTop]}>
                                <View style={styles.txIcon}>
                                    <MaterialIcons name="paid" size={20} color="#4CAF50" />
                                </View>
                                <View style={styles.txInfo}>
                                    <Text style={styles.txTitle}>{activity.text}</Text>
                                    <Text style={styles.txDate}>{format(new Date(activity.time || Date.now()), 'MMM dd, hh:mm a')}</Text>
                                </View>
                                <View style={styles.txAmountContainer}>
                                    <Text style={styles.txAmount}>+ PKR 1,500</Text>
                                    <Text style={styles.txStatus}>{activity.status}</Text>
                                </View>
                            </View>
                        )) || (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>No recent transactions</Text>
                                </View>
                            )}
                    </Card.Content>
                </Card>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing Overview</Text>
                <Card style={styles.pricingCard}>
                    <Card.Content>
                        <View style={styles.pricingRow}>
                            <View>
                                <Text style={styles.pricingLabel}>Peak Hours (6 PM - 11 PM)</Text>
                                <Text style={styles.pricingValue}>PKR 2,000 / hr</Text>
                            </View>
                            <MaterialIcons name="arrow-upward" size={20} color="#FF9800" />
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.pricingRow}>
                            <View>
                                <Text style={styles.pricingLabel}>Off-Peak Hours</Text>
                                <Text style={styles.pricingValue}>PKR 1,200 / hr</Text>
                            </View>
                            <MaterialIcons name="arrow-downward" size={20} color="#4CAF50" />
                        </View>
                    </Card.Content>
                </Card>
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
    statContent: { padding: 16 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    iconContainer: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    badge: { backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
    statValue: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    statTitle: { fontSize: 12, color: '#666' },
    section: { padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
    transactionsCard: { backgroundColor: 'white', overflow: 'hidden' },
    transactionItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    borderTop: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    txIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(76, 175, 80, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    txInfo: { flex: 1 },
    txTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    txDate: { fontSize: 12, color: '#999' },
    txAmountContainer: { alignItems: 'flex-end' },
    txAmount: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4 },
    txStatus: { fontSize: 10, color: '#666', textTransform: 'capitalize' },
    emptyState: { padding: 24, alignItems: 'center' },
    emptyStateText: { color: '#999' },
    pricingCard: { backgroundColor: 'white' },
    pricingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    pricingLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
    pricingValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    divider: { marginVertical: 8 }
});
