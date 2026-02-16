import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('💥 Global Error Boundary Caught:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleRestart = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            // Fallback if expo-updates isn't available (e.g. dev client)
            console.log('Reload not supported, state reset');
            this.setState({ hasError: false, error: null, errorInfo: null });
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="error-outline" size={64} color="#FF6B6B" />
                        </View>

                        <Text style={styles.title}>Oops! Something went wrong.</Text>
                        <Text style={styles.subtitle}>
                            The app encountered an unexpected error.
                        </Text>

                        <View style={styles.errorBox}>
                            <Text style={styles.errorLabel}>Error Details:</Text>
                            <Text style={styles.errorText}>
                                {this.state.error?.toString()}
                            </Text>
                        </View>

                        {this.state.errorInfo && (
                            <View style={styles.stackBox}>
                                <Text style={styles.stackLabel}>Stack Trace:</Text>
                                <Text style={styles.stackText}>
                                    {this.state.errorInfo.componentStack}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                            <MaterialIcons name="refresh" size={24} color="white" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Restart App</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        padding: 24,
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    errorBox: {
        width: '100%',
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFCDD2',
        marginBottom: 16,
    },
    errorLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 14,
        color: '#C62828',
        fontFamily: 'monospace',
    },
    stackBox: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 32,
        maxHeight: 200,
    },
    stackLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 4,
    },
    stackText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#004d43',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
