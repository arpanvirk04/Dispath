import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { CheckCircle, AlertCircle, Clock, Navigation } from 'lucide-react-native';

const getStatusIcon = (status) => {
    switch (status) {
        case 'delivered':
            return <CheckCircle size={18} color="#10B981" />;
        case 'in-progress':
            return <AlertCircle size={18} color="#F59E0B" />;
        default:
            return <Clock size={18} color="#6B7280" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'delivered':
            return '#10B981';
        case 'in-progress':
            return '#F59E0B';
        default:
            return '#6B7280';
    }
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high':
            return '#EF4444';
        case 'medium':
            return '#F59E0B';
        default:
            return '#6B7280';
    }
};

/**
 * Opens Google Maps with the provided address as the destination
 * @param {string} address - The destination address
 */
const openMapsWithAddress = (address) => {
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);

    // Create the Google Maps URL
    const mapsUrl = Platform.select({
        ios: `https://maps.apple.com/?q=${encodedAddress}&dirflg=d`,
        android: `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`,
    });

    // Check if the link can be opened
    Linking.canOpenURL(mapsUrl).then(supported => {
        if (supported) {
            Linking.openURL(mapsUrl);
        } else {
            console.log("Don't know how to open this URL: " + mapsUrl);
            // Fallback to web URL
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
        }
    });
};

export default function DeliveriesScreen({ navigation, route, driver }) {
    const routeOrders = route?.params?.orders || driver?.orders || [];
    const deliveries = routeOrders;
    console.log('DeliveriesScreen rendering orders', deliveries);
    const total = deliveries.length;
    const completed = deliveries.filter(d => d.status === 'delivered').length;

    const handleDeliveryPress = (delivery) => {
        navigation.navigate('DeliveryDetails', { delivery });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Deliveries</Text>
                <Text style={styles.summaryText}>{route?.params?.routeName || driver?.currentRouteName || 'Route'}</Text>
                <Text style={styles.summaryText}>{`${completed} of ${total} Deliveries`}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.deliveryList}>
                {deliveries.length === 0 && (
                    <Text style={styles.emptyText}>No orders assigned yet.</Text>
                )}
                {deliveries.map((item) => (
                    <TouchableOpacity 
                        key={item.orderId} 
                        style={styles.deliveryCard}
                        onPress={() => handleDeliveryPress(item)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.orderId}>{item.service || `Order ${item.orderId}`}</Text>
                            <View style={styles.statusContainer}>
                                {getStatusIcon(item.status)}
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                    {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.detailsText}>Recipient: {item.customerName || 'Customer'}</Text>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                openMapsWithAddress(item.dropoffAddress || item.customerAddress || '');
                            }}
                            style={styles.addressContainer}
                        >
                            <Text style={styles.addressText}>Address: {item.dropoffAddress || item.customerAddress || 'N/A'}</Text>
                            <Navigation size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        {item.customerPhone && (
                            <Text style={styles.detailsText}>Phone: {item.customerPhone}</Text>
                        )}
                        <Text style={[styles.detailsText, { color: getPriorityColor(item.priority) }]}>
                            Priority: {item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Normal'}
                        </Text>
                        {item.notes && <Text style={styles.detailsText}>Notes: {item.notes}</Text>}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    summaryText: {
        marginTop: 6,
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
    },
    deliveryList: {
        padding: 20,
    },
    deliveryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    detailsText: {
        fontSize: 13,
        color: '#374151',
        marginBottom: 2,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
        paddingVertical: 3,
    },
    addressText: {
        fontSize: 13,
        color: '#3B82F6',
        textDecorationLine: 'underline',
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 40,
        fontSize: 16,
    }
});
