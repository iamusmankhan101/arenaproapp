import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    TextInput,
    ScrollView,
    Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function ManualLocationScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock results based on the reference image
    const [results] = useState([
        { id: '1', name: 'Golden Avenue', address: '8502 Preston Rd. Ingl..' },
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.circularBackButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Enter Your Location</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <MaterialIcons name="search" size={24} color="#333" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search location..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#999"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialIcons name="cancel" size={20} color="#3D79F2" />
                            </TouchableOpacity>
                        )}
                        {searchQuery.length === 0 && (
                            <MaterialIcons name="cancel" size={20} color="#3D79F2" />
                        )}
                    </View>
                </View>

                {/* Current Location Option */}
                <TouchableOpacity
                    style={styles.currentLocationRow}
                    onPress={() => navigation.replace('MainTabs')}
                >
                    <View style={styles.navIconContainer}>
                        <MaterialIcons name="near-me" size={22} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.currentLocationText}>Use my current location</Text>
                </TouchableOpacity>

                <View style={styles.separator} />

                {/* Search Results */}
                <View style={styles.resultsSection}>
                    <Text style={styles.sectionTitle}>SEARCH RESULT</Text>
                    {results.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.resultItem}
                            onPress={() => navigation.replace('MainTabs')}
                        >
                            <MaterialIcons name="near-me" size={20} color={theme.colors.primary} style={styles.resultIcon} />
                            <View style={styles.resultTextContainer}>
                                <Text style={styles.resultName}>{String(item.name)}</Text>
                                <Text style={styles.resultAddress}>{String(item.address)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    circularBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    searchContainer: {
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8FA',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Montserrat_500Medium',
        color: '#333',
    },
    currentLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    navIconContainer: {
        marginRight: 15,
    },
    currentLocationText: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
    },
    resultsSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#999',
        letterSpacing: 1,
        marginBottom: 15,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    resultIcon: {
        marginTop: 2,
        marginRight: 15,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultName: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 4,
    },
    resultAddress: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#999',
    },
});
