import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Alert,
    RefreshControl,
    Dimensions,
    Image
} from 'react-native';
import { Text, Searchbar, Card, Button, Surface, ActivityIndicator, Portal, Modal, Divider, RadioButton } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { matchmakingService } from '../../services/matchmakingService';
import { SquadCardSkeleton } from '../../components/SkeletonLoader';

const { width } = Dimensions.get('window');

export default function SquadBuilderScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedGame, setSelectedGame] = useState(null);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joining, setJoining] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('jazzcash');

    const { user } = useSelector(state => state.auth);

    const fetchGames = async () => {
        try {
            setLoading(true);
            console.log('🔍 SquadBuilder: Fetching open games...');
            const openGames = await matchmakingService.getOpenGames();
            console.log('📊 SquadBuilder: Received games:', openGames.length);
            setGames(openGames);
        } catch (error) {
            console.error('❌ SquadBuilder: Error fetching games:', error);
            Alert.alert('Error', 'Failed to load open games');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchGames();
    };

    const handleJoinGame = (game) => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to join a game.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => navigation.navigate('SignIn') }
            ]);
            return;
        }
        setSelectedGame(game);
        setShowJoinModal(true);
    };

    const handleDeleteGame = (game) => {
        Alert.alert(
            'Cancel Game',
            `Are you sure you want to cancel this game? All ${game.playersJoined?.length || 0} participants will be notified.`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await matchmakingService.deleteGame(game.id, user.uid);
                            Alert.alert('Success', 'Game cancelled successfully. All participants have been notified.');
                            fetchGames();
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to cancel game');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const confirmJoin = async () => {
        try {
            setJoining(true);
            await matchmakingService.joinGame(selectedGame.id, user, { method: paymentMethod });
            setShowJoinModal(false);
            Alert.alert('Success', 'You have successfully joined the game!');
            fetchGames();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to join game');
        } finally {
            setJoining(false);
        }
    };

    const filteredGames = games.filter(game =>
        game.turfName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 20 }]}>
                <View>
                    <Text style={styles.headerTitle}>Squad Builder</Text>
                    <Text style={styles.headerSubtitle}>Find teammates and split the cost</Text>
                </View>
                <TouchableOpacity style={styles.infoButton}>
                    <MaterialIcons name="help-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.filterSection}>
                <Searchbar
                    placeholder="Search venues or organizers..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    elevation={0}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >
                {loading && !refreshing ? (
                    <View style={{ paddingHorizontal: 0 }}>
                        {[1, 2, 3].map(i => (
                            <SquadCardSkeleton key={i} />
                        ))}
                    </View>
                ) : filteredGames.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="group-add" size={80} color="#E0E0E0" />
                        <Text style={styles.emptyTitle}>No Games Found</Text>
                        <Text style={styles.emptySubtitle}>Try changing your filters or check back later!</Text>
                        <Button
                            mode="contained"
                            style={styles.bookButton}
                            labelStyle={styles.bookButtonLabel}
                            onPress={() => navigation.navigate('VenueList')}
                        >
                            Start Your Own Game
                        </Button>
                    </View>
                ) : (
                    filteredGames.map(game => (
                        <Card key={game.id} style={styles.gameCard} elevation={2}>
                            <Card.Content>
                                <View style={styles.cardHeader}>
                                    <View style={styles.organizerRow}>
                                        {game.userPhotoURL ? (
                                            <Image
                                                source={{ uri: game.userPhotoURL }}
                                                style={styles.avatarImage}
                                            />
                                        ) : (
                                            <Surface style={styles.avatarCircle} elevation={1}>
                                                <Text style={styles.avatarInitial}>{String(game.userName?.charAt(0) || 'P')}</Text>
                                            </Surface>
                                        )}
                                        <View>
                                            <Text style={styles.organizerName}>{String(game.userName || 'Player')}</Text>
                                            <Text style={styles.organizerTotal}>Organizer</Text>
                                        </View>
                                    </View>
                                    <View style={styles.priceTag}>
                                        <Text style={styles.priceLabel}>PKR</Text>
                                        <Text style={styles.priceValue}>{String(game.slotPricePerPlayer || 0)}</Text>
                                    </View>
                                </View>

                                <View style={styles.gameDetails}>
                                    <View style={styles.venueHeader}>
                                        <Text style={styles.venueName}>{String(game.turfName || 'Venue')}</Text>
                                        <View style={styles.playersBadge}>
                                            <MaterialIcons name="people" size={14} color={theme.colors.secondary} />
                                            <Text style={styles.playersBadgeText}>{String(((game.numberOfPlayers || 1) + (game.playersJoined?.length || 0)) + '/' + ((game.numberOfPlayers || 1) + (game.playersNeeded || 0)) + ' Players')}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="event" size={18} color={theme.colors.primary} />
                                        <Text style={styles.infoText}>
                                            {game.dateTime ? new Date(game.dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="schedule" size={18} color={theme.colors.primary} />
                                        <Text style={styles.infoText}>{String(game.startTime || '')} - {String(game.endTime || '')}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="sports-soccer" size={18} color={theme.colors.primary} />
                                        <Text style={styles.infoText}>{String(game.sport || 'Sport')}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="location-on" size={18} color={theme.colors.primary} />
                                        <Text style={styles.infoText} numberOfLines={1}>{String(game.turfArea || 'Area')}</Text>
                                    </View>
                                </View>

                                <View style={styles.progressSection}>
                                    <View style={styles.progressLabels}>
                                        <Text style={styles.playersJoinedText}>
                                            {String((game.numberOfPlayers || 1) + (game.playersJoined?.length || 0))} Joined
                                        </Text>
                                        <Text style={styles.playersNeededText}>
                                            {String((game.playersNeeded || 0) - (game.playersJoined?.length || 0))} Spots Left
                                        </Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${Math.min(100, (((game.numberOfPlayers || 1) + (game.playersJoined?.length || 0)) / ((game.numberOfPlayers || 1) + (game.playersNeeded || 0))) * 100)}%` }
                                            ]}
                                        />
                                    </View>
                                </View>

                                {game.userId === user?.uid ? (
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteGame(game)}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons name="delete" size={20} color="#fff" />
                                        <Text style={styles.deleteButtonText}>Cancel Game</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[
                                            styles.joinButton,
                                            game.userId === user?.uid && styles.joinButtonDisabled
                                        ]}
                                        onPress={() => handleJoinGame(game)}
                                        disabled={game.userId === user?.uid}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.joinButtonText}>Join Game</Text>
                                    </TouchableOpacity>
                                )}
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>

            {/* Join Modal */}
            <Portal>
                <Modal
                    visible={showJoinModal}
                    onDismiss={() => !joining && setShowJoinModal(false)}
                    contentContainerStyle={styles.modalScroll}
                >
                    <Surface style={styles.modalContent} elevation={5}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderLeft}>
                                <View style={styles.modalIconCircle}>
                                    <MaterialIcons name="group-add" size={24} color={theme.colors.secondary} />
                                </View>
                                <Text style={styles.modalTitle}>Join Game</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowJoinModal(false)}
                                disabled={joining}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {selectedGame && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Game Details Card */}
                                <View style={styles.gameDetailsCard}>
                                    <View style={styles.detailsHeader}>
                                        <MaterialIcons name="sports-soccer" size={20} color={theme.colors.primary} />
                                        <Text style={styles.detailsHeaderText}>Game Details</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.detailIconContainer}>
                                            <MaterialIcons name="location-on" size={18} color={theme.colors.primary} />
                                        </View>
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Venue</Text>
                                            <Text style={styles.detailValue}>{String(selectedGame.turfName || 'Venue')}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.detailIconContainer}>
                                            <MaterialIcons name="event" size={18} color={theme.colors.primary} />
                                        </View>
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Date</Text>
                                            <Text style={styles.detailValue}>
                                                {new Date(selectedGame.dateTime).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.detailIconContainer}>
                                            <MaterialIcons name="schedule" size={18} color={theme.colors.primary} />
                                        </View>
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Time</Text>
                                            <Text style={styles.detailValue}>{String(selectedGame.startTime || '')} - {String(selectedGame.endTime || '')}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.detailIconContainer}>
                                            <MaterialIcons name="people" size={18} color={theme.colors.primary} />
                                        </View>
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Players</Text>
                                            <Text style={styles.detailValue}>
                                                {String(((selectedGame.numberOfPlayers || 1) + (selectedGame.playersJoined?.length || 0)) + '/' + ((selectedGame.numberOfPlayers || 1) + (selectedGame.playersNeeded || 0)) + ' joined')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Payment Section */}
                                <View style={styles.paymentCard}>
                                    <View style={styles.amountContainer}>
                                        <Text style={styles.amountLabel}>Your Share</Text>
                                        <View style={styles.amountBox}>
                                            <Text style={styles.currencySymbol}>PKR</Text>
                                            <Text style={styles.amountValue}>{String(selectedGame.slotPricePerPlayer || 0)}</Text>
                                        </View>
                                        <Text style={styles.amountNote}>Split cost with other players</Text>
                                    </View>

                                    <Divider style={styles.divider} />

                                    <View style={styles.paymentMethodSection}>
                                        <Text style={styles.paymentMethodTitle}>Payment Method</Text>
                                        <RadioButton.Group onValueChange={setPaymentMethod} value={paymentMethod}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.paymentMethodCard,
                                                    paymentMethod === 'jazzcash' && styles.paymentMethodCardSelected
                                                ]}
                                                onPress={() => setPaymentMethod('jazzcash')}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.paymentMethodLeft}>
                                                    <View style={[
                                                        styles.paymentMethodIcon,
                                                        paymentMethod === 'jazzcash' && styles.paymentMethodIconSelected
                                                    ]}>
                                                        <Image
                                                            source={require('../../images/lg-691c164eec616-JazzCash.webp')}
                                                            style={styles.paymentLogo}
                                                            resizeMode="contain"
                                                        />
                                                    </View>
                                                    <View>
                                                        <Text style={[
                                                            styles.paymentMethodText,
                                                            paymentMethod === 'jazzcash' && styles.paymentMethodTextSelected
                                                        ]}>JazzCash</Text>
                                                        <Text style={styles.paymentMethodSubtext}>Mobile Wallet</Text>
                                                    </View>
                                                </View>
                                                <RadioButton value="jazzcash" color={theme.colors.primary} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.paymentMethodCard,
                                                    paymentMethod === 'easypaisa' && styles.paymentMethodCardSelected
                                                ]}
                                                onPress={() => setPaymentMethod('easypaisa')}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.paymentMethodLeft}>
                                                    <View style={[
                                                        styles.paymentMethodIcon,
                                                        paymentMethod === 'easypaisa' && styles.paymentMethodIconSelected
                                                    ]}>
                                                        <Image
                                                            source={require('../../images/easypaisa-pay-logo-11685340011w1ndm8dzgj.png')}
                                                            style={styles.paymentLogo}
                                                            resizeMode="contain"
                                                        />
                                                    </View>
                                                    <View>
                                                        <Text style={[
                                                            styles.paymentMethodText,
                                                            paymentMethod === 'easypaisa' && styles.paymentMethodTextSelected
                                                        ]}>EasyPaisa</Text>
                                                        <Text style={styles.paymentMethodSubtext}>Mobile Wallet</Text>
                                                    </View>
                                                </View>
                                                <RadioButton value="easypaisa" color={theme.colors.primary} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.paymentMethodCard,
                                                    paymentMethod === 'venue' && styles.paymentMethodCardSelected
                                                ]}
                                                onPress={() => setPaymentMethod('venue')}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.paymentMethodLeft}>
                                                    <View style={[
                                                        styles.paymentMethodIcon,
                                                        paymentMethod === 'venue' && styles.paymentMethodIconSelected
                                                    ]}>
                                                        <MaterialIcons
                                                            name="store"
                                                            size={20}
                                                            color={paymentMethod === 'venue' ? theme.colors.secondary : theme.colors.primary}
                                                        />
                                                    </View>
                                                    <View>
                                                        <Text style={[
                                                            styles.paymentMethodText,
                                                            paymentMethod === 'venue' && styles.paymentMethodTextSelected
                                                        ]}>Pay at Venue</Text>
                                                        <Text style={styles.paymentMethodSubtext}>Cash on arrival</Text>
                                                    </View>
                                                </View>
                                                <RadioButton value="venue" color={theme.colors.primary} />
                                            </TouchableOpacity>
                                        </RadioButton.Group>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.confirmButton, joining && styles.confirmButtonDisabled]}
                                    onPress={confirmJoin}
                                    disabled={joining}
                                    activeOpacity={0.8}
                                >
                                    {joining ? (
                                        <ActivityIndicator color={theme.colors.secondary} size="small" />
                                    ) : (
                                        <>
                                            <MaterialIcons name="check-circle" size={20} color={theme.colors.secondary} />
                                            <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </Surface>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
        fontFamily: 'ClashDisplay-Medium',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontFamily: 'Montserrat_400Regular',
        marginTop: 2,
    },
    infoButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    filterSection: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    searchBar: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
    },
    sportFilterContainer: {
        gap: 8,
        paddingBottom: 5,
    },
    sportChip: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    sportChipText: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    centered: {
        marginTop: 100,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontFamily: 'Montserrat_500Medium',
    },
    emptyState: {
        marginTop: 80,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        marginTop: 20,
        fontFamily: 'ClashDisplay-Medium',
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
        fontFamily: 'Montserrat_400Regular',
    },
    bookButton: {
        marginTop: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        elevation: 2,
    },
    bookButtonLabel: {
        color: theme.colors.secondary,
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15,
    },
    gameCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 77, 67, 0.08)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 77, 67, 0.08)',
    },
    organizerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 77, 67, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: 'Montserrat_700Bold',
    },
    organizerName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        fontFamily: 'Montserrat_700Bold',
    },
    organizerTotal: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontFamily: 'Montserrat_500Medium',
        marginTop: 2,
    },
    priceTag: {
        backgroundColor: 'rgba(232, 238, 38, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(232, 238, 38, 0.3)',
    },
    priceLabel: {
        fontSize: 10,
        color: theme.colors.primary,
        fontFamily: 'Montserrat_600SemiBold',
        letterSpacing: 0.5,
    },
    priceValue: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: 'Montserrat_700Bold',
        marginTop: 2,
    },
    gameDetails: {
        backgroundColor: 'rgba(0, 77, 67, 0.04)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: 'rgba(0, 77, 67, 0.08)',
    },
    venueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    venueName: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.text,
        fontFamily: 'Montserrat_700Bold',
        flex: 1,
    },
    playersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    playersBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.secondary,
        fontFamily: 'Montserrat_700Bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginLeft: 8,
        fontFamily: 'Montserrat_500Medium',
        flex: 1,
    },
    progressSection: {
        marginBottom: 20,
        backgroundColor: 'rgba(0, 77, 67, 0.04)',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(0, 77, 67, 0.08)',
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    playersJoinedText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
    },
    playersNeededText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'Montserrat_600SemiBold',
    },
    progressBar: {
        height: 10,
        backgroundColor: 'rgba(0, 77, 67, 0.1)',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.secondary,
        borderRadius: 6,
    },
    joinButton: {
        borderRadius: 14,
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    joinButtonDisabled: {
        backgroundColor: '#CCCCCC',
        elevation: 1,
        shadowOpacity: 0.1,
    },
    joinButtonText: {
        color: theme.colors.secondary,
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15,
    },
    deleteButton: {
        borderRadius: 14,
        backgroundColor: '#DC2626',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        elevation: 3,
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15,
    },
    modalScroll: {
        margin: 20,
        maxHeight: '85%',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        maxHeight: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    modalIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'ClashDisplay-Medium',
        color: theme.colors.text,
        flex: 1,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameDetailsCard: {
        backgroundColor: 'rgba(0, 77, 67, 0.04)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 77, 67, 0.1)',
    },
    detailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 77, 67, 0.1)',
    },
    detailsHeaderText: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: theme.colors.primary,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    detailIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
        justifyContent: 'center',
    },
    detailLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontFamily: 'Montserrat_500Medium',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    amountContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    amountLabel: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'Montserrat_500Medium',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    amountBox: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 6,
    },
    currencySymbol: {
        fontSize: 16,
        color: theme.colors.primary,
        fontFamily: 'Montserrat_600SemiBold',
    },
    amountValue: {
        fontSize: 40,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: 'Montserrat_700Bold',
    },
    amountNote: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: 'Montserrat_400Regular',
        fontStyle: 'italic',
    },
    divider: {
        marginVertical: 20,
        backgroundColor: 'rgba(0, 77, 67, 0.1)',
    },
    paymentMethodSection: {
        gap: 10,
    },
    paymentMethodTitle: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: theme.colors.text,
        marginBottom: 8,
    },
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 77, 67, 0.04)',
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: 'rgba(0, 77, 67, 0.1)',
        marginBottom: 10,
    },
    paymentMethodCardSelected: {
        backgroundColor: 'rgba(0, 77, 67, 0.08)',
        borderColor: theme.colors.primary,
    },
    paymentMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    paymentMethodIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    paymentMethodIconSelected: {
        backgroundColor: 'white',
    },
    paymentLogo: {
        width: 36,
        height: 36,
    },
    paymentMethodText: {
        fontSize: 15,
        color: theme.colors.text,
        fontFamily: 'Montserrat_600SemiBold',
    },
    paymentMethodTextSelected: {
        color: theme.colors.primary,
        fontFamily: 'Montserrat_700Bold',
    },
    paymentMethodSubtext: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontFamily: 'Montserrat_400Regular',
        marginTop: 2,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 4,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    confirmButtonDisabled: {
        backgroundColor: '#CCCCCC',
        elevation: 1,
        shadowOpacity: 0.1,
    },
    confirmButtonText: {
        color: theme.colors.secondary,
        fontFamily: 'Montserrat_700Bold',
        fontSize: 16,
    },
});
