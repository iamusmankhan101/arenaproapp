import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PromoPopup({ visible, onClose, onExplore }) {
    const features = [
        {
            title: 'Daily Reporting',
            desc: 'Financial ledgers and shift reports.',
            icon: 'assessment'
        },
        {
            title: 'WhatsApp API',
            desc: 'Automated confirmations & alerts.',
            icon: 'message'
        },
        {
            title: 'Live Inventory',
            desc: 'Track premium gear in real-time.',
            icon: 'inventory'
        },
        {
            title: 'Marketing Pro',
            desc: '3x more visibility in search.',
            icon: 'campaign'
        }
    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header Banner */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>

                        <Avatar.Icon
                            size={64}
                            icon="star"
                            color="#004d43"
                            style={styles.avatar}
                        />

                        <Text style={styles.title}>
                            Scale with <Text style={styles.highlight}>Arena Pro</Text> 🚀
                        </Text>
                        <Text style={styles.subtitle}>
                            Unlock high-performance tools to grow your business & maximize revenue.
                        </Text>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <View style={styles.featuresGrid}>
                            {features.map((item, i) => (
                                <View key={i} style={styles.featureItem}>
                                    <View style={styles.iconCircle}>
                                        <MaterialIcons name={item.icon} size={20} color="#004d43" />
                                    </View>
                                    <View style={styles.featureText}>
                                        <Text style={styles.featureTitle}>{item.title}</Text>
                                        <Text style={styles.featureDesc}>{item.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <Button
                            mode="contained"
                            onPress={onExplore}
                            style={styles.actionButton}
                            labelStyle={styles.actionButtonLabel}
                            contentStyle={styles.actionButtonContent}
                        >
                            Explore Pro Features
                        </Button>

                        <TouchableOpacity style={styles.laterButton} onPress={onClose}>
                            <Text style={styles.laterText}>I'll decide later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    container: {
        width: width * 0.9,
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10
    },
    header: {
        backgroundColor: '#004d43',
        padding: 24,
        alignItems: 'center',
        position: 'relative'
    },
    closeButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 8
    },
    avatar: {
        backgroundColor: '#e8ee26',
        marginBottom: 16,
        elevation: 4
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8
    },
    highlight: {
        color: '#e8ee26'
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 20
    },
    content: {
        padding: 20
    },
    featuresGrid: {
        marginBottom: 24
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#f8faf9',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#edf2f0'
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,77,67,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    featureText: {
        flex: 1
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#004d43'
    },
    featureDesc: {
        fontSize: 11,
        color: '#666',
        marginTop: 2
    },
    actionButton: {
        backgroundColor: '#004d43',
        borderRadius: 12,
        elevation: 5
    },
    actionButtonContent: {
        paddingVertical: 8
    },
    actionButtonLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white'
    },
    laterButton: {
        marginTop: 12,
        alignItems: 'center'
    },
    laterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600'
    }
});
