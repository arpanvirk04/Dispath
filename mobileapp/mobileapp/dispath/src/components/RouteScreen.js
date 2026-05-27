import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { fetchDriverAssignments, updateDriverLocation } from '../services/api';
import * as Location from 'expo-location';

export default function RouteScreen({ navigation, driver, setDriver }) {
    const [refreshing, setRefreshing] = useState(false);
    const watcherRef = useRef(null);
    const hasRoute = Boolean(driver?.currentRouteId);
    const onRefresh = useCallback(async () => {
        if (!driver?.id) {
            console.log('RouteScreen refresh skipped: no driver id');
            return;
        }
        console.log('Refreshing assignments for driver', driver.id);
        setRefreshing(true);
        try {
            const assignments = await fetchDriverAssignments(driver.id);
            console.log('Assignments loaded', assignments);
            setDriver?.(prev => ({ ...prev, ...assignments }));
        } catch (err) {
            console.warn('Failed to refresh assignments', err);
        } finally {
            setRefreshing(false);
        }
    }, [driver?.id, setDriver]);

    useEffect(() => {
        let cancelled = false;

        const stopTracking = async () => {
            if (watcherRef.current) {
                try {
                    await watcherRef.current.remove();
                } catch (err) {
                    console.warn('Failed to remove location watcher', err);
                }
                watcherRef.current = null;
                console.log('RouteScreen: stopped location watcher');
            }
        };

        const startTracking = async () => {
            if (!driver?.id || !driver?.currentRouteId) {
                await stopTracking();
                return;
            }
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== Location.PermissionStatus.GRANTED) {
                    Alert.alert(
                        'Location Permission Required',
                        'Please enable location permissions so Dispatch can see your progress.'
                    );
                    console.log('RouteScreen: location permission denied');
                    await stopTracking();
                    return;
                }
                console.log('RouteScreen: location permission granted');
            } catch (err) {
                console.warn('Failed to request location permission', err);
                return;
            }

            try {
                console.log('RouteScreen: starting location watcher');
                watcherRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        distanceInterval: 50,
                        timeInterval: 15000
                    },
                    async (position) => {
                        if (cancelled) return;
                        const coords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            timestamp: position.timestamp || Date.now()
                        };
                        console.log('RouteScreen: new position', coords);
                        try {
                            await updateDriverLocation(driver.id, {
                                routeId: driver.currentRouteId,
                                lat: coords.lat,
                                lng: coords.lng,
                                timestamp: coords.timestamp
                            });
                            console.log('RouteScreen: driver location POST success');
                        } catch (err) {
                            console.warn('Failed to send driver location', err?.message || err);
                        }
                    }
                );
            } catch (err) {
                console.warn('Failed to start location watcher', err);
            }
        };

        startTracking();

        return () => {
            cancelled = true;
            stopTracking();
        };
    }, [driver?.id, driver?.currentRouteId]);
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Routes</Text>
                <Text style={styles.subTitle}>
                    {hasRoute ? 'Tap to review deliveries' : 'No routes assigned yet'}
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.routeList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {hasRoute ? (
                    <TouchableOpacity
                        style={styles.routeCard}
                        onPress={() => navigation.navigate('Deliveries', {
                            routeId: driver.currentRouteId,
                            routeName: driver.currentRouteName || driver.currentRouteId,
                            orders: driver.orders || []
                        })}
                    >
                        <View style={styles.cardHeader}>
                            <MapPin size={20} color="#3B82F6" style={styles.icon} />
                            <Text style={styles.routeName}>{driver.currentRouteName || driver.currentRouteId}</Text>
                        </View>
                        <Text style={styles.detailText}>
                            Orders: {driver.orders?.length || 0}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.emptyText}>Dispatcher has not assigned you to a route yet.</Text>
                )}
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
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    subTitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 6,
    },
    routeList: {
        padding: 20,
    },
    routeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    routeName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    detailText: {
        marginTop: 8,
        color: '#6B7280'
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280'
    }
});
