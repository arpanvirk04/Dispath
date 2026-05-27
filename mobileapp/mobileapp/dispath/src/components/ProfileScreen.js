import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

export default function ProfileScreen({ driver }) {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{driver?.name || 'Driver'}</Text>
                <Text style={styles.role}>{driver?.email}</Text>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.sectionTitle}>ID & Contact</Text>
                <Text style={styles.infoText}>ID: {driver?.id}</Text>
                <Text style={styles.infoText}>Email: {driver?.email}</Text>
                <Text style={styles.infoText}>Licence: {driver?.licenceType || 'N/A'}</Text>
                <Text style={styles.infoText}>Status: {driver?.status}</Text>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                <Text style={styles.infoText}>Total Deliveries: 178</Text>
                <Text style={styles.infoText}>Average Rating: 4.8 ★</Text>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <Text style={styles.infoText}>🔔 Notifications: Enabled</Text>
                <Text style={styles.infoText}>📍 Location Tracking: Active</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f0fe',
    },
    header: {
        alignItems: 'center',
        paddingTop: 80,
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 60,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    role: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    infoBox: {
        marginHorizontal: 24,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    infoText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 4,
    },
    logoutButton: {
        marginTop: 12,
        marginHorizontal: 24,
        backgroundColor: '#ff5252',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
