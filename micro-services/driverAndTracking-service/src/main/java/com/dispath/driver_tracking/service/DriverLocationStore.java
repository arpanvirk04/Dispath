package com.dispath.driver_tracking.service;

import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class DriverLocationStore {

    public static class LocationEntry {
        private final String driverId;
        private final String routeId;
        private final double lat;
        private final double lng;
        private final long timestamp;

        public LocationEntry(String driverId, String routeId, double lat, double lng, long timestamp) {
            this.driverId = driverId;
            this.routeId = routeId;
            this.lat = lat;
            this.lng = lng;
            this.timestamp = timestamp;
        }

        public String getDriverId() {
            return driverId;
        }

        public String getRouteId() {
            return routeId;
        }

        public double getLat() {
            return lat;
        }

        public double getLng() {
            return lng;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }

    private final ConcurrentMap<String, LocationEntry> lastByDriver = new ConcurrentHashMap<>();

    public LocationEntry update(String driverId, String routeId, double lat, double lng, long timestamp) {
        LocationEntry entry = new LocationEntry(driverId, routeId, lat, lng, timestamp);
        lastByDriver.put(driverId, entry);
        return entry;
    }

    public Optional<LocationEntry> get(String driverId) {
        return Optional.ofNullable(lastByDriver.get(driverId));
    }
}
